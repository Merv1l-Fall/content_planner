"use client";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Format } from "@/lib/types";

interface BoardHeaderProps {
	title: string;
	format: Format;
}

const BoardHeader = ({ title, format }: BoardHeaderProps) => {
	const { searchQuery, setSearchQuery, openCreateEditor } = useBoardStore();

	return (
		<header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-5 md:px-8 md:py-7">
			<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>

			<div className="flex w-full items-center gap-3 sm:w-auto">
				<label className="flex h-10 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 text-muted focus-within:border-accent sm:w-64 sm:flex-none">
					<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<circle cx="11" cy="11" r="7" />
						<path d="m20 20-3.5-3.5" />
					</svg>
					<input
						type="search"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search board"
						aria-label="Search board"
						className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
					/>
				</label>

				<button
					type="button"
					onClick={() => openCreateEditor(format)}
					className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
				>
					<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
						<path d="M12 5v14M5 12h14" />
					</svg>
					New idea
				</button>
			</div>
		</header>
	);
};

export default BoardHeader;
