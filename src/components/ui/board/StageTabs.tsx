"use client";
import { useDroppable } from "@dnd-kit/core";
import { STAGES } from "@/lib/constants";
import type { BoardCard, Stage } from "@/lib/types";

interface StageTabsProps {
	activeStage: Stage;
	onStageChange: (stage: Stage) => void;
	cards: BoardCard[];
	isDragging: boolean;
	// The tab a dragged card is held over
	hoveredStage: Stage | null;
}

interface StageTabProps {
	stage: Stage;
	label: string;
	count: number;
	isActive: boolean;
	isDragging: boolean;
	isHovered: boolean;
	onSelect: () => void;
}

const StageTab = ({ stage, label, count, isActive, isDragging, isHovered, onSelect }: StageTabProps) => {
	// A card dropped on a tab moves to the top of that stage
	const { setNodeRef } = useDroppable({ id: `tab-${stage}`, data: { type: "tab", stage } });

	const getStateClass = () => {
		if (isHovered) return "border-2 border-accent bg-accent-soft font-semibold text-accent";
		if (isActive) return "bg-surface font-semibold text-foreground shadow-sm";
		if (isDragging) return "border-2 border-dashed border-border font-medium text-muted";
		return "font-medium text-muted";
	};

	return (
		<button
			ref={setNodeRef}
			type="button"
			role="tab"
			aria-selected={isActive}
			onClick={onSelect}
			className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm transition-colors ${getStateClass()}`}
		>
			{label}
			<span className={`text-xs font-medium ${isHovered ? "" : "text-muted"}`}>{count}</span>
		</button>
	);
};

// On a phone only one stage shows at a time, these switch between them
const StageTabs = ({ activeStage, onStageChange, cards, isDragging, hoveredStage }: StageTabsProps) => {
	return (
		<div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3 md:hidden">
			<div role="tablist" aria-label="Stage" className="grid grid-cols-3 gap-1 rounded-xl bg-border/60 p-1">
				{STAGES.map((stage) => (
					<StageTab
						key={stage.id}
						stage={stage.id}
						label={stage.label}
						count={cards.filter((card) => card.stage === stage.id).length}
						isActive={activeStage === stage.id}
						isDragging={isDragging}
						isHovered={hoveredStage === stage.id}
						onSelect={() => onStageChange(stage.id)}
					/>
				))}
			</div>
		</div>
	);
};

export default StageTabs;
