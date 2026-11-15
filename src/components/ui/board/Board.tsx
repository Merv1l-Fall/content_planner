"use client";
import { useEffect, useState } from "react";
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent, Over } from "@dnd-kit/core";
import BoardColumn from "@/components/ui/board/BoardColumn";
import type { DropTarget } from "@/components/ui/board/BoardColumn";
import BoardHeader from "@/components/ui/board/BoardHeader";
import CardContent from "@/components/ui/board/CardContent";
import { FORMATS, STAGES } from "@/lib/constants";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Format } from "@/lib/types";
import { getColumnKey, matchesSearch, sortCards } from "@/lib/utils";

interface BoardProps {
	format: Format;
}

// Finds the column under the pointer, then the card the dragged one would be placed in front of
const detectDropPosition: CollisionDetection = ({ active, collisionRect, droppableContainers, droppableRects, pointerCoordinates }) => {
	const point = pointerCoordinates ?? { x: collisionRect.left + collisionRect.width / 2, y: collisionRect.top + collisionRect.height / 2 };

	const column = droppableContainers.find((container) => {
		const rect = droppableRects.get(container.id);
		if (!rect || container.data.current?.type !== "column") return false;

		return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
	});
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
	const { cards, searchQuery, sortOrders, loadBoard, dropCard } = useBoardStore();
	const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
	const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

	// A small move starts a drag with the mouse, a short press and hold on touch so scrolling still works
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
		useSensor(KeyboardSensor),
	);

	useEffect(() => {
		loadBoard();
	}, [loadBoard]);

	const formatOption = FORMATS.find((option) => option.id === format);
	const visibleCards = cards.filter((card) => card.format === format && matchesSearch(card, searchQuery));
	const draggedCard = cards.find((card) => card.id === draggedCardId) ?? null;

	const handleDragStart = (event: DragStartEvent) => {
		setDraggedCardId(String(event.active.id));
	};

	const handleDragOver = (event: DragOverEvent) => {
		setDropTarget(getDropTarget(event.over));
	};

	const handleDragStop = () => {
		setDraggedCardId(null);
		setDropTarget(null);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const target = getDropTarget(event.over);
		handleDragStop();
		if (!target || !draggedCard) return;

		// Dropped back where it already was
		if (target.stage === draggedCard.stage) {
			const sortOrder = sortOrders[getColumnKey(format, target.stage)] ?? "newest";
			const columnCards = sortCards(visibleCards.filter((card) => card.stage === target.stage), sortOrder);
			const cardAfter = columnCards[columnCards.findIndex((card) => card.id === draggedCard.id) + 1];

			if ((cardAfter?.id ?? null) === target.beforeCardId) return;
		}

		dropCard(draggedCard.id, target.stage, target.beforeCardId);
	};

	return (
		<DndContext id={`board-${format}`} sensors={sensors} collisionDetection={detectDropPosition} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragStop}>
			<BoardHeader title={formatOption?.label ?? ""} format={format} />

			<div className="grid flex-1 grid-cols-1 md:grid-cols-3 md:divide-x md:divide-border">
				{STAGES.map((stage) => (
					<BoardColumn
						key={stage.id}
						format={format}
						stage={stage.id}
						label={stage.label}
						cards={visibleCards.filter((card) => card.stage === stage.id)}
						draggedCard={draggedCard}
						dropTarget={dropTarget}
					/>
				))}
			</div>

			<DragOverlay>
				{draggedCard && (
					<article className="cursor-grabbing rounded-md border border-border bg-surface p-4 opacity-80 shadow-lg">
						<CardContent card={draggedCard} />
					</article>
				)}
			</DragOverlay>
		</DndContext>
	);
};

export default Board;
