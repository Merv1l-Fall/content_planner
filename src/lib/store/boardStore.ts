import { create } from "zustand";
import { addSavedTags, importLocalBoard, removeCard, removeSavedTag as removeSavedTagFromBoard, saveCards, saveSortOrder, subscribeToBoard } from "@/lib/firebase/boardData";
import type { Card, Format, SortOrder, Stage } from "@/lib/types";
import type { CardInput } from "@/lib/validation";
import { addTags, getBoardCards, getColumnKey, getTopOrder, sortCards } from "@/lib/utils";

type EditorState = { mode: "create"; format: Format } | { mode: "edit"; cardId: string } | null;

interface BoardStore {
	// Whose board is open, null when signed out
	userId: string | null;
	cards: Card[];
	savedTags: string[];
	sortOrders: Record<string, SortOrder>;
	searchQuery: string;
	editor: EditorState;
	hasLoaded: boolean;
	syncError: string | null;
	connectBoard: (userId: string) => () => void;
	addCard: (input: CardInput) => void;
	updateCard: (cardId: string, input: CardInput) => void;
	deleteCard: (cardId: string) => void;
	dropCard: (cardId: string, format: Format, targetStage: Stage, beforeCardId: string | null) => void;
	removeSavedTag: (tag: string) => void;
	setSortOrder: (columnKey: string, sortOrder: SortOrder) => void;
	setSearchQuery: (searchQuery: string) => void;
	openCreateEditor: (format: Format) => void;
	openEditEditor: (cardId: string) => void;
	closeEditor: () => void;
}

const emptyBoard = { userId: null, cards: [], savedTags: [], sortOrders: {}, searchQuery: "", editor: null, hasLoaded: false, syncError: null };

export const useBoardStore = create<BoardStore>()((set, get) => {
	// Every action changes the board here first so the screen never waits, then saves to Firestore.
	// A save that Firestore turns down is undone by the next update from subscribeToBoard
	const save = (write: (userId: string) => Promise<void>) => {
		const { userId } = get();
		if (!userId) return;

		write(userId).catch((error) => {
			console.error("Error saving board:", error);
			set({ syncError: "A change could not be saved. Check that you are still signed in, then try again." });
		});
	};

	// Adds the tags that are not saved as suggestions yet, ignoring upper and lower case
	const rememberTags = (tags: string[]) => {
		const { savedTags } = get();
		const nextSavedTags = addTags(savedTags, tags.join(","));
		const newTags = nextSavedTags.slice(savedTags.length);
		if (newTags.length === 0) return;

		set({ savedTags: nextSavedTags });
		save((userId) => addSavedTags(userId, newTags));
	};

	return {
		...emptyBoard,

		// Opens a user's board and keeps it in sync. Returns a function that closes it again
		connectBoard: (userId) => {
			set({ ...emptyBoard, userId });

			const stopListening = subscribeToBoard(userId, {
				onCards: (cards) => set({ cards, hasLoaded: true }),
				onSettings: (settings) => set(settings),
				onError: (error) => {
					console.error("Error loading board:", error);
					set({ syncError: "The board could not be loaded. Reload the page to try again." });
				},
			});

			importLocalBoard(userId).catch((error) => {
				console.error("Error importing the board saved in this browser:", error);
				set({ syncError: "The ideas saved in this browser could not be copied to your account." });
			});

			return () => {
				stopListening();
				set(emptyBoard);
			};
		},

		addCard: ({ formats, ...fields }) => {
			const now = Date.now();

			// New ideas go first in the custom order of every board they are on
			const placements: Card["placements"] = {};
			for (const format of formats) {
				placements[format] = { stage: "ideas", order: getTopOrder(get().cards, format, "ideas") };
			}

			const card: Card = { ...fields, id: crypto.randomUUID(), placements, createdAt: now, updatedAt: now };

			set((state) => ({ cards: [...state.cards, card] }));
			save((userId) => saveCards(userId, [card]));
			rememberTags(fields.tags);
		},

		updateCard: (cardId, { formats, ...fields }) => {
			const existingCard = get().cards.find((card) => card.id === cardId);
			if (!existingCard) return;

			// A board the idea was already on keeps its place, a new board gets it first in Ideas, an unticked board is left out
			const placements: Card["placements"] = {};
			for (const format of formats) {
				placements[format] = existingCard.placements[format] ?? { stage: "ideas", order: getTopOrder(get().cards, format, "ideas") };
			}

			const updatedCard: Card = { ...existingCard, ...fields, placements, updatedAt: Date.now() };

			set((state) => ({ cards: state.cards.map((card) => (card.id === cardId ? updatedCard : card)) }));
			save((userId) => saveCards(userId, [updatedCard]));
			rememberTags(fields.tags);
		},

		deleteCard: (cardId) => {
			set((state) => ({ cards: state.cards.filter((card) => card.id !== cardId) }));
			save((userId) => removeCard(userId, cardId));
		},

		// beforeCardId is the card it was dropped in front of, null means the end of the column
		dropCard: (cardId, format, targetStage, beforeCardId) => {
			const { cards, sortOrders } = get();
			const boardCards = getBoardCards(cards, format);
			const droppedCard = boardCards.find((card) => card.id === cardId);
			if (!droppedCard) return;

			const columnKey = getColumnKey(format, targetStage);
			const isSameColumn = droppedCard.stage === targetStage;
			const isCustomSorted = sortOrders[columnKey] === "custom";

			// The rest of the column in its saved custom order
			const columnCards = sortCards(
				boardCards.filter((card) => card.stage === targetStage && card.id !== cardId),
				"custom",
			);

			// A column sorted by date places the card itself, so it goes first in the custom order
			let insertIndex = 0;
			if (isSameColumn || isCustomSorted) {
				const beforeIndex = columnCards.findIndex((card) => card.id === beforeCardId);
				insertIndex = beforeIndex === -1 ? columnCards.length : beforeIndex;
			}

			const orderedIds = columnCards.map((card) => card.id);
			orderedIds.splice(insertIndex, 0, cardId);

			// Only the cards whose place changed are saved
			const changedCards: Card[] = [];
			const nextCards = cards.map((card) => {
				const order = orderedIds.indexOf(card.id);
				const placement = card.placements[format];
				if (order === -1 || !placement) return card;

				const isDroppedCard = card.id === cardId;
				if (!isDroppedCard && placement.order === order) return card;

				// Only this board's placement changes, the idea stays where it is on the other board
				const changedCard: Card = {
					...card,
					placements: { ...card.placements, [format]: { stage: isDroppedCard ? targetStage : placement.stage, order } },
					updatedAt: isDroppedCard && !isSameColumn ? Date.now() : card.updatedAt,
				};

				changedCards.push(changedCard);
				return changedCard;
			});

			set({ cards: nextCards });
			save((userId) => saveCards(userId, changedCards));

			// Reordering inside a column only makes sense in the custom order
			if (isSameColumn && !isCustomSorted) get().setSortOrder(columnKey, "custom");
		},

		removeSavedTag: (tag) => {
			set((state) => ({ savedTags: state.savedTags.filter((savedTag) => savedTag !== tag) }));
			save((userId) => removeSavedTagFromBoard(userId, tag));
		},

		setSortOrder: (columnKey, sortOrder) => {
			set((state) => ({ sortOrders: { ...state.sortOrders, [columnKey]: sortOrder } }));
			save((userId) => saveSortOrder(userId, columnKey, sortOrder));
		},

		setSearchQuery: (searchQuery) => set({ searchQuery }),
		openCreateEditor: (format) => set({ editor: { mode: "create", format } }),
		openEditEditor: (cardId) => set({ editor: { mode: "edit", cardId } }),
		closeEditor: () => set({ editor: null }),
	};
});
