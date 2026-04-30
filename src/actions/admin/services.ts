"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";
import { requireAdmin } from "./guard";
import { slugify } from "@/lib/slugify";
import { z } from "zod";
import { createSafeAction } from "@/lib/actions/safe-action";

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

const serviceUpsertSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(2),
  shortDescription: z.string().optional(),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(999_999),
  scopeJson: jsonStringArray,
  processJson: jsonProcessArray,
  faqJson: jsonFaqArray,
});

export async function upsertService(formData: FormData) {
  const raw = {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    heroImageUrl: String(formData.get("heroImageUrl") ?? "").trim() || undefined,
    published: formData.get("published") === "on" || formData.get("published") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    scopeJson: String(formData.get("scopeJson") ?? "[]"),
    processJson: String(formData.get("processJson") ?? "[]"),
    faqJson: String(formData.get("faqJson") ?? "[]"),
  };

  const action = createSafeAction({
    scope: "admin.service.upsert",
    schema: serviceUpsertSchema,
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Kaydedilemedi.",
    handler: async (input, ctx) => {
      const slug = input.slug.toLowerCase();
      const scope = input.scopeJson;
      const process = input.processJson;
      const faq = input.faqJson;

      await prisma.service.upsert({
        where: { slug },
        create: {
          slug,
          title: input.title,
          shortDescription: input.shortDescription ?? null,
          heroImageUrl: input.heroImageUrl || null,
          scope: JSON.stringify(scope),
          process: JSON.stringify(process),
          faq: JSON.stringify(faq),
          published: input.published,
          sortOrder: input.sortOrder,
        },
        update: {
          title: input.title,
          shortDescription: input.shortDescription ?? null,
          heroImageUrl: input.heroImageUrl || null,
          scope: JSON.stringify(scope),
          process: JSON.stringify(process),
          faq: JSON.stringify(faq),
          published: input.published,
          sortOrder: input.sortOrder,
        },
        select: { id: true, slug: true },
      });

      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "service.upsert",
        entity: "Service",
        entityId: slug,
        meta: {
          published: input.published,
          sortOrder: input.sortOrder,
          scopeCount: scope.length,
          processCount: process.length,
          faqCount: faq.length,
        },
      });

      revalidatePath("/admin/services");
      revalidatePath("/hizmetlerimiz");
      revalidateTag("public-services");
      revalidateTag(`public-service:${slug}`);
      return undefined;
    },
  });

  return action({
    ...raw,
    slug: raw.slug || slugify(raw.title).toLowerCase(),
    heroImageUrl: raw.heroImageUrl ?? "",
  });
}

