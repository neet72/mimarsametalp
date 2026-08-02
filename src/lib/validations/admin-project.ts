import { z } from "zod";

export function parseImageUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Boş string / NaN → undefined (HTML number input’ları için). */
function optionalInt(min: number, max: number) {
  return z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    if (typeof v === "number" && Number.isNaN(v)) return undefined;
    return v;
  }, z.coerce.number().int().min(min).max(max).optional());
}

export const adminProjectCreateSchema = z.object({
  title: z.string().trim().min(1, "Başlık gerekli").max(200),
  slug: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  description: z.string().trim().max(20_000).optional(),
  status: z.string().trim().max(120).optional(),
  year: optionalInt(1900, 2100),
  location: z.string().trim().max(200).optional(),
  titleEn: z.string().trim().max(200).optional(),
  categoryEn: z.string().trim().max(120).optional(),
  descriptionEn: z.string().trim().max(20_000).optional(),
  statusEn: z.string().trim().max(120).optional(),
  locationEn: z.string().trim().max(200).optional(),
  areaM2: optionalInt(0, 9_999_999),
  imageUrlsText: z.string(),
  published: z.boolean().optional().default(false),
  sortOrder: z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return 0;
    if (typeof v === "number" && Number.isNaN(v)) return 0;
    return v;
  }, z.coerce.number().int().min(0).max(999_999).default(0)),
});

export const adminProjectUpdateSchema = adminProjectCreateSchema.extend({
  id: z.string().min(1),
});
