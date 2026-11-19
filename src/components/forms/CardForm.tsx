"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import TagInput from "@/components/forms/TagInput";
import { FORMATS } from "@/lib/constants";
import { useBoardStore } from "@/lib/store/boardStore";
import type { Card, Format } from "@/lib/types";
import { addTags, getCardFormats } from "@/lib/utils";
import { cardFormSchema } from "@/lib/validation";
import type { CardFormValues, CardInput } from "@/lib/validation";

interface CardFormProps {
	// The formats ticked when the editor opens
	initialFormats: Format[];
	card?: Card;
}

const fieldClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground outline-none placeholder:text-muted focus:border-accent md:text-sm";
const secondaryButtonClass = "rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background";

const CardForm = ({ initialFormats, card }: CardFormProps) => {
	const { addCard, updateCard, deleteCard, closeEditor } = useBoardStore();
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	// Delete removes the idea everywhere, so it counts the boards it is saved on, not the boxes ticked right now
	const isOnBothBoards = card ? getCardFormats(card).length > 1 : false;

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm<CardFormValues>({
		resolver: zodResolver(cardFormSchema),
		defaultValues: {
			title: card?.title ?? "",
			description: card?.description ?? "",
			formats: initialFormats,
			tags: card?.tags ?? [],
			tagDraft: "",
			notes: card?.notes ?? "",
		},
	});
	const tagDraft = useWatch({ control, name: "tagDraft" });
	const tagsError = errors.tags?.message ?? errors.tags?.root?.message ?? errors.tagDraft?.message;

	const onSubmit = (values: CardFormValues) => {
		// Include a tag that was typed but not added yet
		const input: CardInput = { title: values.title, description: values.description, formats: values.formats, tags: addTags(values.tags, values.tagDraft), notes: values.notes };

		if (card) {
			updateCard(card.id, input);
		} else {
			addCard(input);
		}

		closeEditor();
	};

	const handleDelete = () => {
		if (!card) return;

		deleteCard(card.id);
		closeEditor();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="flex h-full flex-col">
			<div className="flex items-center gap-2 border-b border-border px-2 pt-[env(safe-area-inset-top)] md:justify-between md:px-5 md:py-4">
				{/* A phone gets a back arrow and Save up top, a wider screen the close button and the footer */}
				<button type="button" onClick={closeEditor} aria-label="Back to board" className="flex size-11 items-center justify-center rounded-md md:hidden">
					<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="M15 18l-6-6 6-6" />
					</svg>
				</button>
				<h2 className="flex-1 py-4 text-[1.0625rem] font-semibold md:flex-none md:py-0 md:text-lg">{card ? "Edit idea" : "New idea"}</h2>
				<button type="submit" className="mr-2 h-10 rounded-md bg-accent px-4 text-base font-medium text-accent-foreground md:hidden">
					{card ? "Save" : "Add idea"}
				</button>
				<button type="button" onClick={closeEditor} aria-label="Close" className="hidden size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground md:flex">
					<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
						<path d="M6 6l12 12M18 6 6 18" />
					</svg>
				</button>
			</div>

			<div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5 md:px-5">
				<label className="flex flex-col gap-1.5 text-sm font-medium">
					Title
					<input type="text" {...register("title")} maxLength={200} aria-invalid={errors.title ? true : undefined} autoFocus className={fieldClass} />
					{errors.title && <span className="text-sm font-normal text-red-600 dark:text-red-400">{errors.title.message}</span>}
				</label>

				<label className="flex flex-col gap-1.5 text-sm font-medium">
					Description
					<textarea {...register("description")} maxLength={2000} rows={2} placeholder="One or two lines shown on the card" className={fieldClass} />
				</label>

				<Controller
					control={control}
					name="formats"
					render={({ field }) => (
						<fieldset className="flex flex-col gap-2 text-sm font-medium">
							<legend className="mb-2">Formats</legend>
							<div className="flex flex-wrap gap-x-5 gap-y-2">
								{FORMATS.map((option) => {
									const isTicked = field.value.includes(option.id);
									// The last ticked format cannot be unticked, an idea is always on at least one board
									const isLocked = isTicked && field.value.length === 1;

									return (
										<label key={option.id} className={`flex min-h-11 items-center gap-2 font-normal md:min-h-0 ${isLocked ? "text-muted" : ""}`}>
											<input
												type="checkbox"
												checked={isTicked}
												disabled={isLocked}
												onChange={() => field.onChange(isTicked ? field.value.filter((format) => format !== option.id) : [...field.value, option.id])}
												className="size-4 accent-accent"
											/>
											{option.label}
										</label>
									);
								})}
							</div>
							<p className="text-xs font-normal text-muted">The idea shows up on each board you tick. At least one has to stay ticked.</p>
							{errors.formats && <span className="text-sm font-normal text-red-600 dark:text-red-400">{errors.formats.message}</span>}
						</fieldset>
					)}
				/>

				<Controller
					control={control}
					name="tags"
					render={({ field }) => <TagInput tags={field.value} draft={tagDraft} onTagsChange={field.onChange} onDraftChange={(draft) => setValue("tagDraft", draft)} />}
				/>
				{tagsError && <span className="-mt-3 text-sm text-red-600 dark:text-red-400">{tagsError}</span>}

				<label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
					Notes
					<textarea {...register("notes")} maxLength={50000} rows={8} className={`${fieldClass} flex-1`} />
				</label>
			</div>

			<div className={`items-center gap-3 border-t border-border px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:flex md:px-5 md:pb-4 ${card ? "flex" : "hidden"}`}>
				{isConfirmingDelete ? (
					<>
						<p className="mr-auto text-sm">{isOnBothBoards ? "Delete this idea from both boards for good?" : "Delete this idea for good?"}</p>
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
						<button type="button" onClick={closeEditor} className={`${secondaryButtonClass} hidden md:block ${card ? "" : "ml-auto"}`}>
							Cancel
						</button>
						<button type="submit" className="hidden rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 md:block">
							{card ? "Save" : "Add idea"}
						</button>
					</>
				)}
			</div>
		</form>
	);
};

export default CardForm;
