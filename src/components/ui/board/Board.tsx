"use client";
import { useState } from "react";
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent, Over } from "@dnd-kit/core";
import BoardColumn from "@/components/ui/board/BoardColumn";
import type { DropTarget } from "@/components/ui/board/BoardColumn";
import BoardHeader from "@/components/ui/board/BoardHeader";
import CardContent from "@/components/ui/board/CardContent";
import MoveSheet from "@/components/ui/board/MoveSheet";
import StageTabs from "@/components/ui/board/StageTabs";
import { FORMATS, STAGES } from "@/lib/constants";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Format, Stage } from "@/lib/types";
import { getBoardCards, getColumnKey, getFirstCardId, matchesSearch, sortCards } from "@/lib/utils";

interface BoardProps {
	format: Format;
}

// Finds the phone's stage tab or the column under the pointer, then the card the dragged one would be placed in front of
const detectDropPosition: CollisionDetection = ({ active, collisionRect, droppableContainers, droppableRects, pointerCoordinates }) => {
	const point = pointerCoordinates ?? { x: collisionRect.left + collisionRect.width / 2, y: collisionRect.top + collisionRect.height / 2 };

	// Hidden tabs and columns measure as empty boxes, so only the ones on screen can match
	const findUnderPoint = (type: string) =>
		droppableContainers.find((container) => {
			const rect = droppableRects.get(container.id);
			if (!rect || container.data.current?.type !== type) return false;

			return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
		});

	const tab = findUnderPoint("tab");
	if (tab) return [{ id: tab.id }];

	const column = findUnderPoint("column");
	if (!column) return [];

	const cardsBelowPoint = droppableContainers
		.filter((container) => container.data.current?.type === "card" && container.data.current.stage === column.data.current?.stage && container.id !== active.id)
		.map((container) => ({ container, rect: droppableRects.get(container.id) }))
		.filter(({ rect }) => rect && rect.top + rect.height / 2 > point.y)
		.sort((first, second) => (first.rect?.top ?? 0) - (second.rect?.top ?? 0));

	// No card below the pointer means the end of the column
	const target = cardsBelowPoint[0]?.container ?? column;
	return [{ id: target.id }];
};

const getDropTarget = (over: Over | null): DropTarget | null => {
	const data = over?.data.current;
	if (!over || !data) return null;

	return { stage: data.stage, beforeCardId: data.type === "card" ? String(over.id) : null };
};

const Board = ({ format }: BoardProps) => {
	const { cards, searchQuery, sortOrders, dropCard, openCreateEditor } = useBoardStore();
	const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
	const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
	const [hoveredTabStage, setHoveredTabStage] = useState<Stage | null>(null);
	// The one stage a phone shows, wider screens show all three
	const [activeStage, setActiveStage] = useState<Stage>("ideas");

	// A small move starts a drag with the mouse, a short press and hold on touch so scrolling still works
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
		useSensor(KeyboardSensor),
	);

	const formatOption = FORMATS.find((option) => option.id === format);
	const boardCards = getBoardCards(cards, format);
	const visibleCards = boardCards.filter((card) => matchesSearch(card, searchQuery));
	const draggedCard = boardCards.find((card) => card.id === draggedCardId) ?? null;

	// A stage tab drops the card in front of the first card in that stage
	const resolveDropTarget = (over: Over | null): DropTarget | null => {
		const target = getDropTarget(over);
		if (!target || over?.data.current?.type !== "tab" || !draggedCardId) return target;

		return { ...target, beforeCardId: getFirstCardId(boardCards, target.stage, draggedCardId) };
	};

	const handleDragStart = (event: DragStartEvent) => {
		setDraggedCardId(String(event.active.id));
	};

	const handleDragOver = (event: DragOverEvent) => {
		setDropTarget(resolveDropTarget(event.over));
		setHoveredTabStage(event.over?.data.current?.type === "tab" ? event.over.data.current.stage : null);
	};

	const handleDragStop = () => {
		setDraggedCardId(null);
		setDropTarget(null);
		setHoveredTabStage(null);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const target = resolveDropTarget(event.over);
		handleDragStop();
		if (!target || !draggedCard) return;

		// Dropped back where it already was
		if (target.stage === draggedCard.stage) {
			const sortOrder = sortOrders[getColumnKey(format, target.stage)] ?? "newest";
			const columnCards = sortCards(visibleCards.filter((card) => card.stage === target.stage), sortOrder);
			const cardAfter = columnCards[columnCards.findIndex((card) => card.id === draggedCard.id) + 1];

			if ((cardAfter?.id ?? null) === target.beforeCardId) return;
		}

		dropCard(draggedCard.id, format, target.stage, target.beforeCardId);
	};

	return (
		<DndContext id={`board-${format}`} sensors={sensors} collisionDetection={detectDropPosition} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragStop}>
			<BoardHeader title={formatOption?.label ?? ""} format={format} isDragging={draggedCard !== null} />

			<StageTabs activeStage={activeStage} onStageChange={setActiveStage} cards={visibleCards} isDragging={draggedCard !== null} hoveredStage={hoveredTabStage} />

			<div className="grid flex-1 grid-cols-1 content-start md:grid-cols-3 md:content-stretch md:divide-x md:divide-border">
				{STAGES.map((stage) => (
					<BoardColumn
						key={stage.id}
						format={format}
						stage={stage.id}
						label={stage.label}
						cards={visibleCards.filter((card) => card.stage === stage.id)}
						draggedCard={draggedCard}
						dropTarget={dropTarget}
						isShownOnPhone={stage.id === activeStage}
					/>
				))}
			</div>

			<DragOverlay>
				{draggedCard && (
					<article className="cursor-grabbing rounded-md border border-border bg-surface p-4 opacity-80 shadow-lg">
						<CardContent card={draggedCard} format={format} />
					</article>
				)}
			</DragOverlay>

			<button
				type="button"
				onClick={() => openCreateEditor(format)}
				className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex h-13 items-center gap-2 rounded-full bg-accent px-5 text-base font-medium text-accent-foreground shadow-lg md:hidden"
			>
				<svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
					<path d="M12 5v14M5 12h14" />
				</svg>
				New idea
			</button>

			<MoveSheet format={format} />
		</DndContext>
	);
};

export default Board;
