"use client";
import { STAGES } from "@/lib/constants";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Card } from "@/lib/types";
import { formatCardDate } from "@/lib/utils";

interface IdeaCardProps {
	card: Card;
}

const moveButtonClass = "flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground";

const IdeaCard = ({ card }: IdeaCardProps) => {
	const { moveCard, openEditEditor } = useBoardStore();

	const stageIndex = STAGES.findIndex((stage) => stage.id === card.stage);
	const previousStage = STAGES[stageIndex - 1];
	const nextStage = STAGES[stageIndex + 1];

	return (
		<article className="rounded-md border border-border bg-surface p-4">
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

			<div className="mt-4 flex items-center justify-between border-t border-border pt-3">
				{previousStage ? (
					<button type="button" onClick={() => moveCard(card.id, -1)} aria-label={`Move to ${previousStage.label}`} title={`Move to ${previousStage.label}`} className={moveButtonClass}>
						<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M19 12H5M11 6l-6 6 6 6" />
						</svg>
					</button>
				) : (
					<span className="size-8" />
				)}

				<button type="button" onClick={() => openEditEditor(card.id)} className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground">
					Open
				</button>

				{nextStage ? (
					<button type="button" onClick={() => moveCard(card.id, 1)} aria-label={`Move to ${nextStage.label}`} title={`Move to ${nextStage.label}`} className={moveButtonClass}>
						<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</button>
				) : (
					<span className="size-8" />
				)}
			</div>
		</article>
	);
};

export default IdeaCard;
