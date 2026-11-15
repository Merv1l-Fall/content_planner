"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import TagInput from "@/components/forms/TagInput";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Card, CardInput, Format } from "@/lib/types";
import { addTags } from "@/lib/utils";

interface CardFormProps {
	format: Format;
	card?: Card;
}

const fieldClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent";
const secondaryButtonClass = "rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background";

const CardForm = ({ format, card }: CardFormProps) => {
	const { addCard, updateCard, deleteCard, closeEditor } = useBoardStore();

	const [title, setTitle] = useState(card?.title ?? "");
	const [description, setDescription] = useState(card?.description ?? "");
	const [tags, setTags] = useState(card?.tags ?? []);
	const [tagDraft, setTagDraft] = useState("");
	const [notes, setNotes] = useState(card?.notes ?? "");
	const [titleError, setTitleError] = useState("");
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Validate
		if (!title.trim()) {
			setTitleError("Give the idea a title");
			return;
		}

		// Include a tag that was typed but not added yet
		const input: CardInput = { title: title.trim(), description: description.trim(), tags: addTags(tags, tagDraft), notes };

		if (card) {
			updateCard(card.id, input);
		} else {
			addCard(format, input);
		}

		closeEditor();
	};

	const handleDelete = () => {
		if (!card) return;

		deleteCard(card.id);
		closeEditor();
	};

	return (
		<form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b border-border px-5 py-4">
				<h2 className="text-lg font-semibold">{card ? "Edit idea" : "New idea"}</h2>
				<button type="button" onClick={closeEditor} aria-label="Close" className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground">
					<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
						<path d="M6 6l12 12M18 6 6 18" />
					</svg>
				</button>
			</div>

			<div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
				<label className="flex flex-col gap-1.5 text-sm font-medium">
					Title
					<input
						type="text"
						value={title}
						onChange={(event) => {
							setTitle(event.target.value);
							setTitleError("");
						}}
						aria-invalid={titleError ? true : undefined}
						autoFocus
						className={fieldClass}
					/>
					{titleError && <span className="text-sm font-normal text-red-600 dark:text-red-400">{titleError}</span>}
				</label>

				<label className="flex flex-col gap-1.5 text-sm font-medium">
					Description
					<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="One or two lines shown on the card" className={fieldClass} />
				</label>

				<TagInput tags={tags} draft={tagDraft} onTagsChange={setTags} onDraftChange={setTagDraft} />

				<label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
					Notes
					<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={8} className={`${fieldClass} flex-1`} />
				</label>
			</div>

			<div className="flex items-center gap-3 border-t border-border px-5 py-4">
				{isConfirmingDelete ? (
					<>
						<p className="mr-auto text-sm">Delete this idea for good?</p>
						<button type="button" onClick={() => setIsConfirmingDelete(false)} className={secondaryButtonClass}>
							Keep
						</button>
						<button type="button" onClick={handleDelete} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
							Delete
						</button>
					</>
				) : (
					<>
						{card && (
							<button type="button" onClick={() => setIsConfirmingDelete(true)} className="mr-auto rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-background dark:text-red-400">
								Delete
							</button>
						)}
						<button type="button" onClick={closeEditor} className={`${secondaryButtonClass} ${card ? "" : "ml-auto"}`}>
							Cancel
						</button>
						<button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90">
							{card ? "Save" : "Add idea"}
						</button>
					</>
				)}
			</div>
		</form>
	);
};

export default CardForm;
