"use client";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface BottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	label: string;
	children: ReactNode;
}

// A panel that slides up from the bottom of a phone screen, built on the native dialog like the card editor
const BottomSheet = ({ isOpen, onClose, label, children }: BottomSheetProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	// Open and close the native dialog to follow isOpen
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen && !dialog.open) dialog.showModal();
		if (!isOpen && dialog.open) dialog.close();
	}, [isOpen]);

	return (
		<dialog
			ref={dialogRef}
			aria-label={label}
			onClose={onClose}
			// The dialog itself only gets clicks on the dimmed backdrop, the content sits in the inner div
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-full rounded-t-2xl bg-surface p-0 text-foreground backdrop:bg-black/40"
		>
			<div className="flex flex-col px-4 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
				<div className="mb-4 h-1 w-9 self-center rounded-full bg-border" aria-hidden="true" />
				{children}
			</div>
		</dialog>
	);
};

export default BottomSheet;
