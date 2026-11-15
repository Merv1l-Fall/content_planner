"use client";
import { useEffect, useRef } from "react";
import CardForm from "@/components/forms/CardForm";
import { useBoardStore } from "@/lib/store/boardStore";

const CardEditor = () => {
	const { editor, cards, closeEditor } = useBoardStore();
	const dialogRef = useRef<HTMLDialogElement>(null);

	const editingCard = editor?.mode === "edit" ? cards.find((card) => card.id === editor.cardId) : undefined;

	// Open and close the native dialog to follow the store
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (editor && !dialog.open) dialog.showModal();
		if (!editor && dialog.open) dialog.close();
	}, [editor]);

	return (
		<dialog
			ref={dialogRef}
			onClose={closeEditor}
			className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md border-l border-border bg-surface p-0 text-foreground backdrop:bg-black/40"
		>
			{editor?.mode === "create" && <CardForm key="new" format={editor.format} />}
			{editor?.mode === "edit" && editingCard && <CardForm key={editingCard.id} format={editingCard.format} card={editingCard} />}
		</dialog>
	);
};

export default CardEditor;
