export type Format = "long" | "short";

export type Stage = "ideas" | "drafts" | "inWorks";

export type SortOrder = "newest" | "oldest" | "custom";

export interface Card {
	id: string;
	title: string;
	description: string;
	tags: string[];
	notes: string;
	format: Format;
	stage: Stage;
	// Position in the column's custom order, lowest first
	order: number;
	createdAt: number;
	updatedAt: number;
}
