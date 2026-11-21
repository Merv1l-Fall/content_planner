import type { Format, Stage } from "@/lib/types";

// Placeholder name, change it here when the app gets a real one
export const APP_NAME = "Content Planner";

export const THEME_STORAGE_KEY = "theme";

interface FormatOption {
	id: Format;
	label: string;
	href: string;
}

interface StageOption {
	id: Stage;
	label: string;
}

export const FORMATS: FormatOption[] = [
	{ id: "long", label: "Long form", href: "/long-form" },
	{ id: "short", label: "Short form", href: "/short-form" },
];

export const ARCHIVE_HREF = "/archive";

export const STAGES: StageOption[] = [
	{ id: "ideas", label: "Ideas" },
	{ id: "drafts", label: "Drafts" },
	{ id: "inWorks", label: "In works" },
];
