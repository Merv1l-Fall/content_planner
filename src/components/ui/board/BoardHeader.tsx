"use client";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Format } from "@/lib/types";

interface BoardHeaderProps {
	title: string;
	format: Format;
	isDragging: boolean;
}

const BoardHeader = ({ title, format, isDragging }: BoardHeaderProps) => {
	const { searchQuery, setSearchQuery, openCreateEditor } = useBoardStore();

	return (
		<header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 md:gap-4 md:border-b md:border-border md:px-8 md:py-7">
			<h1 className="text-[1.75rem] font-semibold tracking-tight md:text-4xl">{title}</h1>

			<div className="flex w-full items-center gap-3 md:w-auto">
				{/* Takes the search field's place while dragging on a phone, so nothing below it moves */}
				{isDragging && (
					<p className="flex h-11 flex-1 items-center gap-2 rounded-md bg-accent-soft px-3 text-sm font-medium text-accent md:hidden">
						<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4" />
						</svg>
						Drop on a tab to change stage
					</p>
				)}

				<label className={`h-11 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 text-muted focus-within:border-accent md:flex md:h-10 md:w-64 md:flex-none ${isDragging ? "hidden" : "flex"}`}>
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
						className="w-full min-w-0 bg-transparent text-base text-foreground md:text-sm outline-none placeholder:text-muted"
					/>
				</label>

				<button
					type="button"
					onClick={() => openCreateEditor(format)}
					className="hidden h-10 shrink-0 items-center gap-2 rounded-md bg-accent md:flex px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
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
