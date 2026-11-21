export type Format = "long" | "short";

export type Stage = "ideas" | "drafts" | "inWorks";

export type SortOrder = "newest" | "oldest" | "custom";

// Where an idea sits on one board
export interface Placement {
	stage: Stage;
	// Position in the column's custom order, lowest first
	order: number;
	// Set while the idea is archived on this board, it keeps its stage so a restore puts it back there
	archivedAt?: number;
}

export interface Card {
	id: string;
	title: string;
	description: string;
	tags: string[];
	notes: string;
	// One entry per board the idea is on, each board keeps its own stage and position
	placements: Partial<Record<Format, Placement>>;
	createdAt: number;
	updatedAt: number;
}

// A card as it appears on one board, with that board's stage and position
export interface BoardCard extends Card, Placement {}

// An idea archived on one board, there is one entry per board it was archived on
export interface ArchivedCard extends BoardCard {
	format: Format;
	archivedAt: number;
}
