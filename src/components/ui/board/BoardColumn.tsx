"use client";
import IdeaCard from "@/components/ui/board/IdeaCard";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Card, Format, SortOrder, Stage } from "@/lib/types";
import { getColumnKey, sortCards } from "@/lib/utils";

interface BoardColumnProps {
	format: Format;
	stage: Stage;
	label: string;
	cards: Card[];
}

const BoardColumn = ({ format, stage, label, cards }: BoardColumnProps) => {
	const { sortOrders, searchQuery, hasLoaded, setSortOrder } = useBoardStore();

	const columnKey = getColumnKey(format, stage);
	const sortOrder = sortOrders[columnKey] ?? "newest";
	const sortedCards = sortCards(cards, sortOrder);

	return (
		<section className="flex min-w-0 flex-col gap-4 border-b border-border px-4 py-5 md:border-b-0 md:px-5">
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
				</select>
			</div>

			{sortedCards.map((card) => (
				<IdeaCard key={card.id} card={card} />
			))}

			{hasLoaded && cards.length === 0 && (
				<p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">{searchQuery.trim() ? "No matches" : "Nothing here yet"}</p>
			)}
		</section>
	);
};

export default BoardColumn;
