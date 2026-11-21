"use client";
import { useState } from "react";
import { FORMATS, STAGES } from "@/lib/constants";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Format } from "@/lib/types";
import { formatCardDate, getArchivedCards, matchesSearch } from "@/lib/utils";

type FormatFilter = Format | "all";

const filterOptions: { id: FormatFilter; label: string }[] = [{ id: "all", label: "All" }, ...FORMATS.map(({ id, label }) => ({ id, label }))];

const actionButtonClass = "min-h-11 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground md:min-h-0 md:py-1.5";

// Finished ideas from both boards, with a way to put them back
const ArchiveList = () => {
	const { cards, hasLoaded, restoreCard, openEditEditor } = useBoardStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");

	const archivedCards = getArchivedCards(cards);
	const visibleCards = archivedCards.filter((card) => (formatFilter === "all" || card.format === formatFilter) && matchesSearch(card, searchQuery));

	return (
		<>
			<header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 md:gap-4 md:border-b md:border-border md:px-8 md:py-7">
				<h1 className="text-[1.75rem] font-semibold tracking-tight md:text-4xl">Archive</h1>

				<label className="flex h-11 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 text-muted focus-within:border-accent md:h-10 md:w-64">
					<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<circle cx="11" cy="11" r="7" />
						<path d="m20 20-3.5-3.5" />
					</svg>
					<input
						type="search"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search archive"
						aria-label="Search archive"
						className="w-full min-w-0 bg-transparent text-base text-foreground md:text-sm outline-none placeholder:text-muted"
					/>
				</label>
			</header>

			<div className="flex flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
				<div role="radiogroup" aria-label="Format" className="flex gap-1 self-start rounded-xl bg-border/60 p-1">
					{filterOptions.map((option) => {
						const isActive = formatFilter === option.id;
						const count = option.id === "all" ? archivedCards.length : archivedCards.filter((card) => card.format === option.id).length;

						return (
							<button
								key={option.id}
								type="button"
								role="radio"
								aria-checked={isActive}
								onClick={() => setFormatFilter(option.id)}
								className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors ${isActive ? "bg-surface font-semibold text-foreground shadow-sm" : "font-medium text-muted"}`}
							>
								{option.label}
								<span className="text-xs font-medium text-muted">{count}</span>
							</button>
						);
					})}
				</div>

				{hasLoaded && visibleCards.length === 0 && (
					<p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
						{archivedCards.length === 0 ? "Nothing archived yet. Archive an idea from its board once it's done." : "No matches"}
					</p>
				)}

				<ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
					{visibleCards.map((card) => {
						const formatLabel = FORMATS.find((option) => option.id === card.format)?.label;
						const stageLabel = STAGES.find((stage) => stage.id === card.stage)?.label;

						return (
							<li key={`${card.id}-${card.format}`} className="flex flex-col rounded-md border border-border bg-surface p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="flex flex-wrap gap-1.5">
										{card.tags.map((tag) => (
											<span key={tag} className="rounded bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
												{tag}
											</span>
										))}
									</div>
									<span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted">{formatLabel}</span>
								</div>

								<h2 className="mt-2 text-base font-semibold break-words">{card.title}</h2>
								{card.description && <p className="mt-1 text-sm break-words text-muted">{card.description}</p>}

								<p className="mt-3 text-xs text-muted">
									Archived <time dateTime={new Date(card.archivedAt).toISOString()}>{formatCardDate(card.archivedAt)}</time> from {stageLabel}
								</p>

								<div className="mt-3 flex justify-end gap-1 border-t border-border pt-0.5 md:pt-2">
									<button type="button" onClick={() => restoreCard(card.id, card.format)} className={actionButtonClass}>
										Restore
									</button>
									<button type="button" onClick={() => openEditEditor(card.id)} className={`-mr-2 ${actionButtonClass}`}>
										Open
									</button>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
};

export default ArchiveList;
