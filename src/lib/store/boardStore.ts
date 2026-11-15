import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STAGES } from "@/lib/constants";
import type { Card, CardInput, Format, SortOrder } from "@/lib/types";
import { addTags } from "@/lib/utils";

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
	moveCard: (cardId: string, direction: -1 | 1) => void;
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
				const card: Card = { ...input, id: crypto.randomUUID(), format, stage: "ideas", createdAt: now, updatedAt: now };

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

			moveCard: (cardId, direction) => {
				const card = get().cards.find((existingCard) => existingCard.id === cardId);
				if (!card) return;

				const stageIndex = STAGES.findIndex((stage) => stage.id === card.stage);
				const nextStage = STAGES[stageIndex + direction];
				if (!nextStage) return;

				set((state) => ({
					cards: state.cards.map((existingCard) => (existingCard.id === cardId ? { ...existingCard, stage: nextStage.id, updatedAt: Date.now() } : existingCard)),
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
			partialize: (state) => ({ cards: state.cards, savedTags: state.savedTags, sortOrders: state.sortOrders }),
			skipHydration: true,
		},
	),
);
