import { FORMATS } from "@/lib/constants";
import type { ArchivedCard, BoardCard, Card, Format, SortOrder, Stage } from "@/lib/types";

// Each column on each tab remembers its own sort order
export const getColumnKey = (format: Format, stage: Stage) => {
	return `${format}-${stage}`;
};

// The boards an idea is on, in tab order
export const getCardFormats = (card: Card) => {
	return FORMATS.map((option) => option.id).filter((format) => card.placements[format]);
};

// The cards on one board, each with its stage and position on that board. Archived ones are left out
export const getBoardCards = (cards: Card[], format: Format) => {
	return cards.flatMap((card): BoardCard[] => {
		const placement = card.placements[format];
		return placement && placement.archivedAt === undefined ? [{ ...card, ...placement }] : [];
	});
};

// Every archived entry on every board, most recently archived first
export const getArchivedCards = (cards: Card[]) => {
	return cards
		.flatMap((card) =>
			FORMATS.flatMap(({ id: format }): ArchivedCard[] => {
				const placement = card.placements[format];
				return placement?.archivedAt !== undefined ? [{ ...card, ...placement, format, archivedAt: placement.archivedAt }] : [];
			}),
		)
		.sort((first, second) => second.archivedAt - first.archivedAt);
};

// The order that puts a card first in a column's custom order
export const getTopOrder = (cards: Card[], format: Format, stage: Stage) => {
	const orders = getBoardCards(cards, format)
		.filter((card) => card.stage === stage)
		.map((card) => card.order);

	return orders.length > 0 ? Math.min(...orders) - 1 : 0;
};

export const formatCardDate = (timestamp: number) => {
	return new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

export const matchesSearch = (card: Card, searchQuery: string) => {
	const query = searchQuery.trim().toLowerCase();
	if (!query) return true;

	const searchableText = [card.title, card.description, card.notes, ...card.tags].join(" ").toLowerCase();
	return searchableText.includes(query);
};

export const sortCards = (cards: BoardCard[], sortOrder: SortOrder) => {
	return [...cards].sort((first, second) => {
		if (sortOrder === "custom" && first.order !== second.order) return first.order - second.order;

		return sortOrder === "oldest" ? first.createdAt - second.createdAt : second.createdAt - first.createdAt;
	});
};

// Adds one or more comma separated tags, skipping empty ones and duplicates
export const addTags = (tags: string[], text: string) => {
	const nextTags = [...tags];

	for (const part of text.split(",")) {
		const tag = part.trim();
		if (!tag) continue;

		const isDuplicate = nextTags.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase());
		if (isDuplicate) continue;

		nextTags.push(tag);
	}

	return nextTags;
};

// The card first in a column's custom order, leaving one card out. Dropping in front of it puts a card at the top
export const getFirstCardId = (boardCards: BoardCard[], stage: Stage, skippedCardId: string) => {
	const columnCards = boardCards.filter((card) => card.stage === stage && card.id !== skippedCardId);
	return sortCards(columnCards, "custom")[0]?.id ?? null;
};
