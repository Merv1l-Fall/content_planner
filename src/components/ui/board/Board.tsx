"use client";
import { useEffect } from "react";
import BoardColumn from "@/components/ui/board/BoardColumn";
import BoardHeader from "@/components/ui/board/BoardHeader";
import { FORMATS, STAGES } from "@/lib/constants";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Format } from "@/lib/types";
import { matchesSearch } from "@/lib/utils";

interface BoardProps {
	format: Format;
}

const Board = ({ format }: BoardProps) => {
	const { cards, searchQuery, loadBoard } = useBoardStore();
	const formatOption = FORMATS.find((option) => option.id === format);

	useEffect(() => {
		loadBoard();
	}, [loadBoard]);

	const visibleCards = cards.filter((card) => card.format === format && matchesSearch(card, searchQuery));

	return (
		<>
			<BoardHeader title={formatOption?.label ?? ""} format={format} />

			<div className="grid flex-1 grid-cols-1 md:grid-cols-3 md:divide-x md:divide-border">
				{STAGES.map((stage) => (
					<BoardColumn key={stage.id} format={format} stage={stage.id} label={stage.label} cards={visibleCards.filter((card) => card.stage === stage.id)} />
				))}
			</div>
		</>
	);
};

export default Board;
