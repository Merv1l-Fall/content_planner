import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, CardInput, Format, SortOrder, Stage } from "@/lib/types";
import { addTags, getColumnKey, sortCards } from "@/lib/utils";

type EditorState = { mode: "create"; format: Format } | { mode: "edit"; cardId: string } | null;

interface BoardStore {
	cards: Card[];
	savedTags: string[];
	sortOrders: Record<string, SortOrder>;
	searchQuery: string;
	editor: EditorState;
	hasLoaded: boolean;
	loadBoard: () => Promise<void>;
	addCard: (format: Format, input: CardInput) => void;
	updateCard: (cardId: string, input: CardInput) => void;
	deleteCard: (cardId: string) => void;
	dropCard: (cardId: string, targetStage: Stage, beforeCardId: string | null) => void;
	removeSavedTag: (tag: string) => void;
	setSortOrder: (columnKey: string, sortOrder: SortOrder) => void;
	setSearchQuery: (searchQuery: string) => void;
	openCreateEditor: (format: Format) => void;
	openEditEditor: (cardId: string) => void;
	closeEditor: () => void;
}

export const useBoardStore = create<BoardStore>()(
	persist(
		(set, get) => ({
			cards: [],
			savedTags: [],
			sortOrders: {},
			searchQuery: "",
			editor: null,
			hasLoaded: false,

			// Reads the board saved in this browser, Firestore replaces this later
			loadBoard: async () => {
				if (get().hasLoaded) return;

				try {
					await useBoardStore.persist.rehydrate();
				} catch (error) {
					console.error("Error loading board:", error);
				}

				set({ hasLoaded: true });
			},

			addCard: (format, input) => {
				const now = Date.now();

				// New ideas go first in the custom order
				const ideaOrders = get()
					.cards.filter((card) => card.format === format && card.stage === "ideas")
					.map((card) => card.order);
				const order = ideaOrders.length > 0 ? Math.min(...ideaOrders) - 1 : 0;

				const card: Card = { ...input, id: crypto.randomUUID(), format, stage: "ideas", order, createdAt: now, updatedAt: now };

				set((state) => ({
					cards: [...state.cards, card],
					savedTags: addTags(state.savedTags, input.tags.join(",")),
				}));
			},

			updateCard: (cardId, input) => {
				set((state) => ({
					cards: state.cards.map((card) => (card.id === cardId ? { ...card, ...input, updatedAt: Date.now() } : card)),
					savedTags: addTags(state.savedTags, input.tags.join(",")),
				}));
			},

			deleteCard: (cardId) => set((state) => ({ cards: state.cards.filter((card) => card.id !== cardId) })),

			// beforeCardId is the card it was dropped in front of, null means the end of the column
			dropCard: (cardId, targetStage, beforeCardId) => {
				const { cards, sortOrders } = get();
				const droppedCard = cards.find((card) => card.id === cardId);
				if (!droppedCard) return;

				const columnKey = getColumnKey(droppedCard.format, targetStage);
				const isSameColumn = droppedCard.stage === targetStage;
				const isCustomSorted = sortOrders[columnKey] === "custom";

				// The rest of the column in its saved custom order
				const columnCards = sortCards(
					cards.filter((card) => card.format === droppedCard.format && card.stage === targetStage && card.id !== cardId),
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

				set((state) => ({
					cards: state.cards.map((card) => {
						const order = orderedIds.indexOf(card.id);
						if (order === -1) return card;
						if (card.id !== cardId) return { ...card, order };

						return { ...card, order, stage: targetStage, updatedAt: isSameColumn ? card.updatedAt : Date.now() };
					}),
					// Reordering inside a column only makes sense in the custom order
					sortOrders: isSameColumn ? { ...state.sortOrders, [columnKey]: "custom" } : state.sortOrders,
				}));
			},

			removeSavedTag: (tag) => set((state) => ({ savedTags: state.savedTags.filter((savedTag) => savedTag !== tag) })),
			setSortOrder: (columnKey, sortOrder) => set((state) => ({ sortOrders: { ...state.sortOrders, [columnKey]: sortOrder } })),
			setSearchQuery: (searchQuery) => set({ searchQuery }),
			openCreateEditor: (format) => set({ editor: { mode: "create", format } }),
			openEditEditor: (cardId) => set({ editor: { mode: "edit", cardId } }),
			closeEditor: () => set({ editor: null }),
		}),
		{
			name: "content-planner-board",
			version: 1,
			partialize: (state) => ({ cards: state.cards, savedTags: state.savedTags, sortOrders: state.sortOrders }),
			skipHydration: true,
			// Cards saved before custom sorting existed have no order yet, newest goes first
			migrate: (persistedState) => {
				const state = persistedState as Pick<BoardStore, "cards" | "savedTags" | "sortOrders">;
				const cards = state.cards.map((card) => ({ ...card, order: card.order ?? -card.createdAt }));

				return { ...state, cards };
			},
		},
	),
);
