"use client";
import type { KeyboardEvent } from "react";
import { useBoardStore } from "@/lib/store/boardStore";
import { addTags } from "@/lib/utils";

interface TagInputProps {
	tags: string[];
	draft: string;
	onTagsChange: (tags: string[]) => void;
	onDraftChange: (draft: string) => void;
}

const removeIcon = (
	<svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
		<path d="M6 6l12 12M18 6 6 18" />
	</svg>
);

const TagInput = ({ tags, draft, onTagsChange, onDraftChange }: TagInputProps) => {
	const { savedTags, removeSavedTag } = useBoardStore();

	// Saved tags that are not on this card yet
	const availableTags = savedTags.filter((savedTag) => !tags.some((tag) => tag.toLowerCase() === savedTag.toLowerCase()));

	const handleAddDraft = () => {
		onTagsChange(addTags(tags, draft));
		onDraftChange("");
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter" && event.key !== ",") return;

		// Enter should add the tag, not save the whole card
		event.preventDefault();
		handleAddDraft();
	};

	return (
		<div className="flex flex-col gap-2 text-sm font-medium">
			<label htmlFor="card-tags">Tags</label>

			{tags.length > 0 && (
				<ul className="flex flex-wrap gap-1.5">
					{tags.map((tag) => (
						<li key={tag} className="flex items-center gap-1 rounded bg-accent-soft py-0.5 pr-1 pl-2 text-xs text-accent">
							{tag}
							<button type="button" onClick={() => onTagsChange(tags.filter((existingTag) => existingTag !== tag))} aria-label={`Remove ${tag} from this idea`} className="flex size-5 items-center justify-center rounded hover:bg-surface">
								{removeIcon}
							</button>
						</li>
					))}
				</ul>
			)}

			<div className="flex gap-2">
				<input
					id="card-tags"
					type="text"
					value={draft}
					onChange={(event) => onDraftChange(event.target.value)}
					onKeyDown={handleKeyDown}
					maxLength={50}
					placeholder="Type a tag and press Enter"
					className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none placeholder:text-muted focus:border-accent"
				/>
				<button type="button" onClick={handleAddDraft} disabled={!draft.trim()} className="shrink-0 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-background disabled:opacity-50">
					Add
				</button>
			</div>

			{availableTags.length > 0 && (
				<div className="flex flex-col gap-1.5">
					<p className="text-xs font-normal text-muted">Saved tags</p>
					<ul className="flex flex-wrap gap-1.5">
						{availableTags.map((savedTag) => (
							<li key={savedTag} className="flex items-center rounded border border-border text-xs font-normal">
								<button type="button" onClick={() => onTagsChange(addTags(tags, savedTag))} className="rounded-l py-1 pr-1 pl-2 hover:bg-background">
									{savedTag}
								</button>
								<button type="button" onClick={() => removeSavedTag(savedTag)} aria-label={`Forget saved tag ${savedTag}`} title="Forget this saved tag" className="flex size-6 items-center justify-center rounded-r text-muted hover:bg-background hover:text-foreground">
									{removeIcon}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default TagInput;
