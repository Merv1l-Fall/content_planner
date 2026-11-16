"use client";
import { useDroppable } from "@dnd-kit/core";
import IdeaCard from "@/components/ui/board/IdeaCard";
import { useBoardStore } from "@/lib/store/boardStore";
import type { BoardCard, Format, SortOrder, Stage } from "@/lib/types";
import { getColumnKey, sortCards } from "@/lib/utils";

export interface DropTarget {
	stage: Stage;
	beforeCardId: string | null;
}

interface BoardColumnProps {
	format: Format;
	stage: Stage;
	label: string;
	cards: BoardCard[];
	draggedCard: BoardCard | null;
	dropTarget: DropTarget | null;
}

const BoardColumn = ({ format, stage, label, cards, draggedCard, dropTarget }: BoardColumnProps) => {
	const { sortOrders, searchQuery, hasLoaded, setSortOrder } = useBoardStore();
	const { setNodeRef } = useDroppable({ id: `column-${stage}`, data: { type: "column", stage } });

	const columnKey = getColumnKey(format, stage);
	const sortOrder = sortOrders[columnKey] ?? "newest";
	const sortedCards = sortCards(cards, sortOrder);

	// The drop position only matters in the custom order, or when reordering inside this column
	const isDropTarget = draggedCard !== null && dropTarget?.stage === stage;
	const showsDropPosition = isDropTarget && (sortOrder === "custom" || draggedCard.stage === stage);

	return (
		<section ref={setNodeRef} className={`flex min-w-0 flex-col gap-4 border-b border-border px-4 py-5 transition-colors md:border-b-0 md:px-5 ${isDropTarget && !showsDropPosition ? "bg-accent-soft" : ""}`}>
			<div className="flex items-center gap-3 border-b border-border pb-4">
				<h2 className="text-sm font-semibold">{label}</h2>
				<span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted">{cards.length}</span>

				<select
					value={sortOrder}
					onChange={(event) => setSortOrder(columnKey, event.target.value as SortOrder)}
					aria-label={`Sort ${label}`}
					className="ml-auto rounded-md bg-transparent py-1 text-xs text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
				>
					<option value="newest">Newest first</option>
					<option value="oldest">Oldest first</option>
					<option value="custom">Custom</option>
				</select>
			</div>

			{sortedCards.map((card) => (
				<IdeaCard key={card.id} card={card} showDropLine={showsDropPosition && dropTarget?.beforeCardId === card.id} />
			))}

			{showsDropPosition && dropTarget?.beforeCardId === null && cards.length > 0 && (
				<div className="relative">
					<div className="absolute inset-x-0 -top-3 h-1 rounded bg-accent" />
				</div>
			)}

			{hasLoaded && cards.length === 0 && (
				<p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">{searchQuery.trim() ? "No matches" : "Nothing here yet"}</p>
			)}
		</section>
	);
};

export default BoardColumn;
