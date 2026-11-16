import { z } from "zod";
import { addTags } from "@/lib/utils";

// The fields you fill in yourself in the card editor. The limits match the ones in firestore.rules, change them in both places
export const cardSchema = z.object({
	title: z.string().trim().min(1, "Give the idea a title").max(200, "Keep the title under 200 characters"),
	description: z.string().trim().max(2000, "Keep the description under 2,000 characters"),
	formats: z.array(z.enum(["long", "short"])).min(1, "Keep at least one format ticked"),
	tags: z.array(z.string().max(50, "Keep each tag under 50 characters")).max(30, "An idea can have up to 30 tags"),
	notes: z.string().max(50000, "Keep the notes under 50,000 characters"),
});

// tagDraft is the text typed in the tag field that has not been added as a tag yet
export const cardFormSchema = cardSchema
	.extend({
		tagDraft: z.string().max(50, "Keep each tag under 50 characters"),
	})
	// A typed tag is added when the card is saved, so it counts towards the limit too
	.refine((values) => addTags(values.tags, values.tagDraft).length <= 30, { path: ["tags"], message: "An idea can have up to 30 tags" });

export type CardInput = z.infer<typeof cardSchema>;
export type CardFormValues = z.infer<typeof cardFormSchema>;
