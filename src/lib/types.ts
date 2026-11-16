export type Format = "long" | "short";

export type Stage = "ideas" | "drafts" | "inWorks";

export type SortOrder = "newest" | "oldest" | "custom";

// Where an idea sits on one board
export interface Placement {
	stage: Stage;
	// Position in the column's custom order, lowest first
	order: number;
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
