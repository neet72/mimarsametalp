import { z } from "zod";

export function parseImageUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const adminProjectCreateSchema = z.object({
  title: z.string().trim().min(1, "Başlık gerekli").max(200),
  slug: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  description: z.string().trim().max(20_000).optional(),
  imageUrlsText: z.string(),
  published: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999_999).optional().default(0),
});

export const adminProjectUpdateSchema = adminProjectCreateSchema.extend({
  id: z.string().min(1),
});
