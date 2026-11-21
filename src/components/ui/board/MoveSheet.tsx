"use client";
import BottomSheet from "@/components/ui/overlay/BottomSheet";
import { FORMATS, STAGES } from "@/lib/constants";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Format } from "@/lib/types";
import { getBoardCards, getCardFormats, getColumnKey, getFirstCardId, sortCards } from "@/lib/utils";

interface MoveSheetProps {
	format: Format;
}

const stepButtonClass = "flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-40";

// The phone's way to move an idea without dragging it
const MoveSheet = ({ format }: MoveSheetProps) => {
	const { cards, sortOrders, movingCardId, dropCard, archiveCard, closeMoveSheet } = useBoardStore();

	const boardCards = getBoardCards(cards, format);
	const card = boardCards.find((boardCard) => boardCard.id === movingCardId);
	const formatLabel = FORMATS.find((option) => option.id === format)?.label ?? "";

	// Up and down follow the custom order, so they only show when the column is sorted that way
	const sortOrder = card ? (sortOrders[getColumnKey(format, card.stage)] ?? "newest") : "newest";
	const columnCards = card ? sortCards(boardCards.filter((boardCard) => boardCard.stage === card.stage), "custom") : [];
	const position = card ? columnCards.findIndex((boardCard) => boardCard.id === card.id) : -1;

	const handleMoveUp = () => {
		if (!card || position <= 0) return;
		dropCard(card.id, format, card.stage, columnCards[position - 1].id);
	};

	const handleMoveDown = () => {
		if (!card || position === -1 || position >= columnCards.length - 1) return;
		// In front of the card two places down, or the end of the column
		dropCard(card.id, format, card.stage, columnCards[position + 2]?.id ?? null);
	};

	return (
		<BottomSheet isOpen={card !== undefined} onClose={closeMoveSheet} label="Move idea">
			{card && (
				<>
					<p className="text-sm text-muted">Move idea</p>
					<h2 className="mt-0.5 mb-4 text-lg font-semibold wrap-break-word">{card.title}</h2>

					<div className="flex flex-col overflow-hidden rounded-xl border border-border">
						{STAGES.map((stage) => {
							const isCurrent = stage.id === card.stage;
							const count = boardCards.filter((boardCard) => boardCard.stage === stage.id).length;

							return (
								<button
									key={stage.id}
									type="button"
									disabled={isCurrent}
									onClick={() => {
										dropCard(card.id, format, stage.id, getFirstCardId(boardCards, stage.id, card.id));
										closeMoveSheet();
									}}
									className={`flex min-h-14 items-center gap-3 border-b border-border px-4 text-left text-base last:border-b-0 ${isCurrent ? "bg-accent-soft font-semibold text-accent" : "font-medium"}`}
								>
									<span className="flex-1">{stage.label}</span>
									{isCurrent ? (
										<>
											<span className="text-sm font-medium">Current</span>
											<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<path d="M5 12.5l4.5 4.5L19 7.5" />
											</svg>
										</>
									) : (
										<span className="text-sm text-muted">{count === 1 ? "1 idea" : `${count} ideas`}</span>
									)}
								</button>
							);
						})}
					</div>

					<p className="mt-3.5 text-sm text-muted">
						It goes first in the new stage&apos;s custom order.
						{getCardFormats(card).length > 1 && ` Only moves it on ${formatLabel}.`}
					</p>

					{sortOrder === "custom" && (
						<div className="mt-4 grid grid-cols-2 gap-2">
							<button type="button" onClick={handleMoveUp} disabled={position <= 0} className={stepButtonClass}>
								<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<path d="M12 19V5M6 11l6-6 6 6" />
								</svg>
								Move up
							</button>
							<button type="button" onClick={handleMoveDown} disabled={position >= columnCards.length - 1} className={stepButtonClass}>
								<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<path d="M12 5v14M6 13l6 6 6-6" />
								</svg>
								Move down
							</button>
						</div>
					)}

					<button
						type="button"
						onClick={() => {
							archiveCard(card.id, format);
							closeMoveSheet();
						}}
						className={`${stepButtonClass} mt-4 w-full`}
					>
						<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M3 4h18v4H3zM5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
						</svg>
						Archive
					</button>

					<button type="button" onClick={closeMoveSheet} className="mt-2 min-h-12 rounded-lg text-base font-medium text-muted">
						Cancel
					</button>
				</>
			)}
		</BottomSheet>
	);
};

export default MoveSheet;
