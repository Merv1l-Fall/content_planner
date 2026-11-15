"use client";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Card } from "@/lib/types";
import { formatCardDate } from "@/lib/utils";

interface CardContentProps {
	card: Card;
}

// What is shown inside a card, shared by the card on the board and the copy that follows the pointer
const CardContent = ({ card }: CardContentProps) => {
	const { openEditEditor } = useBoardStore();

	return (
		<>
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-wrap gap-1.5">
					{card.tags.map((tag) => (
						<span key={tag} className="rounded bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
							{tag}
						</span>
					))}
				</div>
				<time dateTime={new Date(card.createdAt).toISOString()} className="shrink-0 text-xs text-muted">
					{formatCardDate(card.createdAt)}
				</time>
			</div>

			<h3 className="mt-2 text-base font-semibold break-words">{card.title}</h3>
			{card.description && <p className="mt-1 text-sm break-words text-muted">{card.description}</p>}

			<div className="mt-3 flex justify-end border-t border-border pt-2">
				<button type="button" onClick={() => openEditEditor(card.id)} className="-mr-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground">
					Open
				</button>
			</div>
		</>
	);
};

export default CardContent;
