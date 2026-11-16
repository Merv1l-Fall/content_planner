import { z } from "zod";

// The fields you fill in yourself in the card editor
export const cardSchema = z.object({
	title: z.string().trim().min(1, "Give the idea a title"),
	description: z.string().trim(),
	tags: z.array(z.string()),
	notes: z.string(),
});

// tagDraft is the text typed in the tag field that has not been added as a tag yet
export const cardFormSchema = cardSchema.extend({
	tagDraft: z.string(),
});

export type CardInput = z.infer<typeof cardSchema>;
export type CardFormValues = z.infer<typeof cardFormSchema>;
