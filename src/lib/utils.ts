import type { Card, Format, SortOrder, Stage } from "@/lib/types";

// Each column on each tab remembers its own sort order
export const getColumnKey = (format: Format, stage: Stage) => {
	return `${format}-${stage}`;
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

export const sortCards = (cards: Card[], sortOrder: SortOrder) => {
	return [...cards].sort((first, second) => {
		return sortOrder === "newest" ? second.createdAt - first.createdAt : first.createdAt - second.createdAt;
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
