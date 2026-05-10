import { z } from "zod";

const jsonStringArray = z
  .string()
  .default("[]")
  .transform((v, ctx) => {
    try {
      const parsed = JSON.parse(v) as unknown;
      if (!Array.isArray(parsed) || parsed.some((x) => typeof x !== "string")) {
        ctx.addIssue({ code: "custom", message: "Geçersiz dizi." });
        return [];
      }
      return parsed as string[];
    } catch {
      ctx.addIssue({ code: "custom", message: "Geçersiz JSON." });
      return [];
    }
  });

const jsonProcessArray = z
  .string()
  .default("[]")
  .transform((v, ctx) => {
    try {
      const parsed = JSON.parse(v) as unknown;
      if (!Array.isArray(parsed)) {
        ctx.addIssue({ code: "custom", message: "Geçersiz süreç." });
        return [];
      }
      const arr = parsed
        .map((x) => (typeof x === "object" && x ? x : null))
        .filter(Boolean) as Array<Record<string, unknown>>;
      return arr
        .map((x) => ({
          title: String(x.title ?? "").trim(),
          description: String(x.description ?? "").trim(),
        }))
        .filter((x) => x.title.length > 0 || x.description.length > 0);
    } catch {
      ctx.addIssue({ code: "custom", message: "Geçersiz JSON." });
      return [];
    }
  });

const jsonFaqArray = z
  .string()
  .default("[]")
  .transform((v, ctx) => {
    try {
      const parsed = JSON.parse(v) as unknown;
      if (!Array.isArray(parsed)) {
        ctx.addIssue({ code: "custom", message: "Geçersiz SSS." });
        return [];
      }
      const arr = parsed
        .map((x) => (typeof x === "object" && x ? x : null))
        .filter(Boolean) as Array<Record<string, unknown>>;
      return arr
        .map((x) => ({
          question: String(x.question ?? "").trim(),
          answer: String(x.answer ?? "").trim(),
        }))
        .filter((x) => x.question.length > 0 || x.answer.length > 0);
    } catch {
      ctx.addIssue({ code: "custom", message: "Geçersiz JSON." });
      return [];
    }
  });

/** TR ile aynı uzunlukta kalır (boş çeviri satırları silinmez) — public birleştirme için */
const jsonStringArrayAligned = z
  .string()
  .default("[]")
  .transform((v, ctx) => {
    try {
      const parsed = JSON.parse(v) as unknown;
      if (!Array.isArray(parsed) || parsed.some((x) => typeof x !== "string")) {
        ctx.addIssue({ code: "custom", message: "Geçersiz dizi." });
        return [];
      }
      return (parsed as string[]).map((s) => String(s).trim());
    } catch {
      ctx.addIssue({ code: "custom", message: "Geçersiz JSON." });
      return [];
    }
  });

const jsonProcessArrayAligned = z
  .string()
  .default("[]")
  .transform((v, ctx) => {
    try {
      const parsed = JSON.parse(v) as unknown;
      if (!Array.isArray(parsed)) {
        ctx.addIssue({ code: "custom", message: "Geçersiz süreç." });
        return [];
      }
      const arr = parsed
        .map((x) => (typeof x === "object" && x ? x : null))
        .filter(Boolean) as Array<Record<string, unknown>>;
      return arr.map((x) => ({
        title: String(x.title ?? "").trim(),
        description: String(x.description ?? "").trim(),
      }));
    } catch {
      ctx.addIssue({ code: "custom", message: "Geçersiz JSON." });
      return [];
    }
  });

const jsonFaqArrayAligned = z
  .string()
  .default("[]")
  .transform((v, ctx) => {
    try {
      const parsed = JSON.parse(v) as unknown;
      if (!Array.isArray(parsed)) {
        ctx.addIssue({ code: "custom", message: "Geçersiz SSS." });
        return [];
      }
      const arr = parsed
        .map((x) => (typeof x === "object" && x ? x : null))
        .filter(Boolean) as Array<Record<string, unknown>>;
      return arr.map((x) => ({
        question: String(x.question ?? "").trim(),
        answer: String(x.answer ?? "").trim(),
      }));
    } catch {
      ctx.addIssue({ code: "custom", message: "Geçersiz JSON." });
      return [];
    }
  });

const heroImageUrlField = z
  .preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z
      .string()
      .max(2000)
      .optional()
      .refine(
        (s) => !s || s.startsWith("/") || /^https?:\/\//i.test(s),
        "Tam URL veya `/` ile başlayan yol kullanın.",
      ),
  );

export const adminServiceCreateSchema = z.object({
  title: z.string().trim().min(2, "Başlık en az 2 karakter olmalı.").max(200),
  slug: z.string().trim().max(120).optional(),
  shortDescription: z.string().trim().max(2000).optional(),
  titleEn: z.string().trim().max(200).optional(),
  shortDescriptionEn: z.string().trim().max(2000).optional(),
  heroImageUrl: heroImageUrlField,
  published: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999_999).optional().default(0),
  scopeJson: jsonStringArray,
  processJson: jsonProcessArray,
  faqJson: jsonFaqArray,
  scopeJsonEn: jsonStringArrayAligned,
  processJsonEn: jsonProcessArrayAligned,
  faqJsonEn: jsonFaqArrayAligned,
});

export const adminServiceUpdateSchema = adminServiceCreateSchema.extend({
  id: z.string().min(1),
});
