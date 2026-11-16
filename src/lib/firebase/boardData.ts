import { arrayRemove, arrayUnion, collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import type { Card, Format, SortOrder, Stage } from "@/lib/types";

// The board saved in this browser before sign-in existed
const LOCAL_BOARD_KEY = "content-planner-board";
const LOCAL_BOARD_BACKUP_KEY = "content-planner-board-imported";

// Firestore allows 500 writes in one batch
const BATCH_SIZE = 400;

export interface BoardSettings {
	savedTags: string[];
	sortOrders: Record<string, SortOrder>;
}

// How cards were saved when an idea could only be on one board
type SingleBoardCard = Omit<Card, "placements"> & { format: Format; stage: Stage; order?: number };

interface LocalBoard {
	state?: { cards?: (Card | SingleBoardCard)[]; savedTags?: string[]; sortOrders?: Record<string, SortOrder> };
	version?: number;
}

interface BoardListeners {
	onCards: (cards: Card[]) => void;
	onSettings: (settings: BoardSettings) => void;
	onError: (error: Error) => void;
}

const getSettingsDoc = (userId: string) => {
	return doc(getDb(), "users", userId);
};

const getCardDoc = (userId: string, cardId: string) => {
	return doc(getDb(), "users", userId, "cards", cardId);
};

// The id is the document's name, so it is not saved inside the document as well
const toCardData = (card: Card) => {
	return {
		title: card.title,
		description: card.description,
		notes: card.notes,
		tags: card.tags,
		placements: card.placements,
		createdAt: card.createdAt,
		updatedAt: card.updatedAt,
	};
};

// Keeps the board up to date with Firestore, including changes made on other devices. Returns a function that stops listening
export const subscribeToBoard = (userId: string, { onCards, onSettings, onError }: BoardListeners) => {
	const stopCards = onSnapshot(
		collection(getDb(), "users", userId, "cards"),
		(snapshot) => onCards(snapshot.docs.map((cardDoc) => ({ ...cardDoc.data(), id: cardDoc.id }) as Card)),
		onError,
	);

	const stopSettings = onSnapshot(
		getSettingsDoc(userId),
		(snapshot) => {
			const data = snapshot.data();
			onSettings({ savedTags: data?.savedTags ?? [], sortOrders: data?.sortOrders ?? {} });
		},
		onError,
	);

	return () => {
		stopCards();
		stopSettings();
	};
};

// The promises from these only settle once the server has the change, which can be much later when offline. The local copy updates right away

export const saveCards = async (userId: string, cards: Card[]) => {
	for (let start = 0; start < cards.length; start += BATCH_SIZE) {
		const batch = writeBatch(getDb());
		for (const card of cards.slice(start, start + BATCH_SIZE)) {
			batch.set(getCardDoc(userId, card.id), toCardData(card));
		}

		await batch.commit();
	}
};

export const removeCard = (userId: string, cardId: string) => {
	return deleteDoc(getCardDoc(userId, cardId));
};

export const addSavedTags = async (userId: string, tags: string[]) => {
	if (tags.length === 0) return;

	await setDoc(getSettingsDoc(userId), { savedTags: arrayUnion(...tags) }, { merge: true });
};

export const removeSavedTag = (userId: string, tag: string) => {
	return setDoc(getSettingsDoc(userId), { savedTags: arrayRemove(tag) }, { merge: true });
};

export const saveSortOrder = (userId: string, columnKey: string, sortOrder: SortOrder) => {
	return setDoc(getSettingsDoc(userId), { sortOrders: { [columnKey]: sortOrder } }, { merge: true });
};

// Copies the board saved in this browser into the account, once. The local copy is kept under another name as a backup
export const importLocalBoard = async (userId: string) => {
	const savedBoard = localStorage.getItem(LOCAL_BOARD_KEY);
	if (!savedBoard) return;

	const { state, version = 0 }: LocalBoard = JSON.parse(savedBoard);

	const cards = (state?.cards ?? []).map((savedCard): Card => {
		if (version >= 2) return savedCard as Card;

		// Cards saved before custom sorting existed have no order yet, newest goes first
		const { format, stage, order, ...card } = savedCard as SingleBoardCard;
		return { ...card, placements: { [format]: { stage, order: order ?? -card.createdAt } } };
	});

	// Moved first so a second tab or a reload cannot import it again
	localStorage.setItem(LOCAL_BOARD_BACKUP_KEY, savedBoard);
	localStorage.removeItem(LOCAL_BOARD_KEY);

	await Promise.all([
		saveCards(userId, cards),
		addSavedTags(userId, state?.savedTags ?? []),
		setDoc(getSettingsDoc(userId), { sortOrders: state?.sortOrders ?? {} }, { merge: true }),
	]);
};
