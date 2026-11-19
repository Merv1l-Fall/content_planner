"use client";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import CardContent from "@/components/ui/board/CardContent";
import type { BoardCard } from "@/lib/types";

interface IdeaCardProps {
	card: BoardCard;
	showDropLine: boolean;
}

const IdeaCard = ({ card, showDropLine }: IdeaCardProps) => {
	const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({ id: card.id });
	// Each card is also a drop target, so another card can be placed in front of it
	const { setNodeRef: setDroppableRef } = useDroppable({ id: card.id, data: { type: "card", stage: card.stage } });

	const setRefs = (node: HTMLElement | null) => {
		setDraggableRef(node);
		setDroppableRef(node);
	};

	return (
		<div className="relative">
			{showDropLine && <div className="absolute inset-x-0 -top-3 h-1 rounded bg-accent" />}

			<article
				ref={setRefs}
				{...attributes}
				{...listeners}
				className={`cursor-grab touch-manipulation rounded-md [-webkit-touch-callout:none] border border-border bg-surface p-4 select-none focus-visible:outline-2 focus-visible:outline-accent ${isDragging ? "opacity-40" : ""}`}
			>
				<CardContent card={card} />
			</article>
		</div>
	);
};

export default IdeaCard;
