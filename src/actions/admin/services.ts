"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";
import { requireAdmin } from "./guard";
import { slugify } from "@/lib/slugify";
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
  let actor = "unknown";
  try {
    const session = await requireAdmin();
    actor = session.user.email ?? "unknown";
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      return { ok: false as const, error: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin." };
    }
    throw e;
  }

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

  const parsed = serviceUpsertSchema.safeParse({
    ...raw,
    slug: raw.slug || slugify(raw.title).toLowerCase(),
    heroImageUrl: raw.heroImageUrl ?? "",
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Geçersiz veri." };
  }

  const data = parsed.data;
  const slug = data.slug.toLowerCase();
  const scope = data.scopeJson;
  const process = data.processJson;
  const faq = data.faqJson;

  try {
    await prisma.service.upsert({
      where: { slug },
      create: {
        slug,
        title: data.title,
        shortDescription: data.shortDescription ?? null,
        heroImageUrl: data.heroImageUrl || null,
        scope: JSON.stringify(scope),
        process: JSON.stringify(process),
        faq: JSON.stringify(faq),
        published: data.published,
        sortOrder: data.sortOrder,
      },
      update: {
        title: data.title,
        shortDescription: data.shortDescription ?? null,
        heroImageUrl: data.heroImageUrl || null,
        scope: JSON.stringify(scope),
        process: JSON.stringify(process),
        faq: JSON.stringify(faq),
        published: data.published,
        sortOrder: data.sortOrder,
      },
      select: { id: true, slug: true },
    });

    await auditAdmin({
      actor,
      action: "service.upsert",
      entity: "Service",
      entityId: slug,
      meta: {
        published: data.published,
        sortOrder: data.sortOrder,
        scopeCount: scope.length,
        processCount: process.length,
        faqCount: faq.length,
      },
    });
  } catch (e) {
    console.error("[upsertService]", e);
    return {
      ok: false as const,
      error:
        "Kaydedilemedi. (DB migration/db push yapılmadıysa önce onu çalıştırmanız gerekebilir.)",
    };
  }

  revalidatePath("/admin/services");
  revalidatePath("/hizmetlerimiz");
  revalidateTag("public-services");
  return { ok: true as const };
}

