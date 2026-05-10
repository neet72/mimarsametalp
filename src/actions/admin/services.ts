"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";
import { requireAdmin } from "./guard";
import { slugify } from "@/lib/slugify";
import { z } from "zod";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { logger } from "@/lib/observability/logger";
import { adminServiceCreateSchema, adminServiceUpdateSchema } from "@/lib/validations/admin-service";
import { SERVICES_GALLERY as SERVICES_GALLERY_TR } from "@/content/services-gallery";
import { SERVICES_DETAIL } from "@/content/services-detail";

function revalidateServicePaths(slugs: string[]) {
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/hizmetlerimiz");
  revalidatePath("/en/hizmetlerimiz");
  revalidateTag("public-services");
  for (const s of slugs) {
    if (s) revalidateTag(`public-service:${s}`);
    revalidatePath(`/hizmetlerimiz/${s}`);
    revalidatePath(`/en/hizmetlerimiz/${s}`);
  }
}

export async function createService(formData: FormData) {
  const raw = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    titleEn: String(formData.get("titleEn") ?? "").trim() || undefined,
    shortDescriptionEn: String(formData.get("shortDescriptionEn") ?? "").trim() || undefined,
    heroImageUrl: String(formData.get("heroImageUrl") ?? ""),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    scopeJson: String(formData.get("scopeJson") ?? "[]"),
    processJson: String(formData.get("processJson") ?? "[]"),
    faqJson: String(formData.get("faqJson") ?? "[]"),
    scopeJsonEn: String(formData.get("scopeJsonEn") ?? "[]"),
    processJsonEn: String(formData.get("processJsonEn") ?? "[]"),
    faqJsonEn: String(formData.get("faqJsonEn") ?? "[]"),
  };

  const action = createSafeAction({
    scope: "admin.service.create",
    schema: adminServiceCreateSchema,
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    toFieldErrors: (err) => err.flatten().fieldErrors,
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Kayıt oluşturulamadı.",
    handler: async (input, ctx) => {
      const slugBase = input.slug && input.slug.length > 0 ? input.slug : slugify(input.title);
      const slug = slugBase.toLowerCase();
      const scope = input.scopeJson;
      const process = input.processJson;
      const faq = input.faqJson;
      const scopeEn = input.scopeJsonEn;
      const processEn = input.processJsonEn;
      const faqEn = input.faqJsonEn;

      try {
        await prisma.service.create({
          data: {
            slug,
            title: input.title,
            shortDescription: input.shortDescription ?? null,
            titleEn: input.titleEn || null,
            shortDescriptionEn: input.shortDescriptionEn || null,
            heroImageUrl: input.heroImageUrl || null,
            scope: JSON.stringify(scope),
            process: JSON.stringify(process),
            faq: JSON.stringify(faq),
            scopeEn: JSON.stringify(scopeEn),
            processEn: JSON.stringify(processEn),
            faqEn: JSON.stringify(faqEn),
            published: input.published ?? false,
            sortOrder: input.sortOrder ?? 0,
          } as any,
          select: { id: true },
        });
      } catch (e) {
        logger.warn({
          msg: "service create failed",
          scope: "admin.service.create",
          actor: ctx.actor,
          error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
        });
        throw new ActionError("Kayıt oluşturulamadı (slug benzersiz mi?).");
      }

      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "service.create",
        entity: "Service",
        entityId: slug,
        meta: {
          published: Boolean(input.published),
          sortOrder: input.sortOrder ?? 0,
          scopeCount: scope.length,
          processCount: process.length,
          faqCount: faq.length,
        },
      });

      revalidateServicePaths([slug]);
      return undefined;
    },
  });

  return action(raw);
}

export async function updateService(formData: FormData) {
  const raw = {
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    titleEn: String(formData.get("titleEn") ?? "").trim() || undefined,
    shortDescriptionEn: String(formData.get("shortDescriptionEn") ?? "").trim() || undefined,
    heroImageUrl: String(formData.get("heroImageUrl") ?? ""),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    scopeJson: String(formData.get("scopeJson") ?? "[]"),
    processJson: String(formData.get("processJson") ?? "[]"),
    faqJson: String(formData.get("faqJson") ?? "[]"),
    scopeJsonEn: String(formData.get("scopeJsonEn") ?? "[]"),
    processJsonEn: String(formData.get("processJsonEn") ?? "[]"),
    faqJsonEn: String(formData.get("faqJsonEn") ?? "[]"),
  };

  const action = createSafeAction({
    scope: "admin.service.update",
    schema: adminServiceUpdateSchema,
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    toFieldErrors: (err) => err.flatten().fieldErrors,
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Güncelleme başarısız.",
    handler: async (input, ctx) => {
      const slugBase = input.slug && input.slug.length > 0 ? input.slug : slugify(input.title);
      const slug = slugBase.toLowerCase();
      const scope = input.scopeJson;
      const process = input.processJson;
      const faq = input.faqJson;
      const scopeEn = input.scopeJsonEn;
      const processEn = input.processJsonEn;
      const faqEn = input.faqJsonEn;

      let prevSlug: string | undefined;
      try {
        const prev = await prisma.service.findUnique({
          where: { id: input.id },
          select: { slug: true },
        });
        prevSlug = prev?.slug;

        await prisma.service.update({
          where: { id: input.id },
          data: {
            slug,
            title: input.title,
            shortDescription: input.shortDescription ?? null,
            titleEn: input.titleEn || null,
            shortDescriptionEn: input.shortDescriptionEn || null,
            heroImageUrl: input.heroImageUrl || null,
            scope: JSON.stringify(scope),
            process: JSON.stringify(process),
            faq: JSON.stringify(faq),
            scopeEn: JSON.stringify(scopeEn),
            processEn: JSON.stringify(processEn),
            faqEn: JSON.stringify(faqEn),
            published: input.published ?? false,
            sortOrder: input.sortOrder ?? 0,
          } as any,
          select: { id: true },
        });
      } catch (e) {
        logger.warn({
          msg: "service update failed",
          scope: "admin.service.update",
          actor: ctx.actor,
          error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
        });
        throw new ActionError("Güncelleme başarısız (slug kullanımda olabilir).");
      }

      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "service.update",
        entity: "Service",
        entityId: input.id,
        meta: {
          slug,
          published: Boolean(input.published),
          sortOrder: input.sortOrder ?? 0,
          scopeCount: scope.length,
          processCount: process.length,
          faqCount: faq.length,
        },
      });

      const slugs = Array.from(new Set([prevSlug, slug].filter(Boolean))) as string[];
      revalidateServicePaths(slugs);
      revalidatePath(`/admin/services/${input.id}/edit`);
      return undefined;
    },
  });

  return action(raw);
}

export async function deleteService(id: string) {
  const action = createSafeAction({
    scope: "admin.service.delete",
    schema: z.object({ id: z.string().min(1) }),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz id.",
    failureMessage: "Silinemedi.",
    handler: async (input, ctx) => {
      const row = await prisma.service.delete({
        where: { id: input.id },
        select: { slug: true },
      });
      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "service.delete",
        entity: "Service",
        entityId: input.id,
        meta: { slug: row.slug },
      });
      revalidateServicePaths([row.slug]);
      return undefined;
    },
  });

  return action({ id });
}

export async function setServicePublished(id: string, published: boolean) {
  const action = createSafeAction({
    scope: "admin.service.setPublished",
    schema: z.object({ id: z.string().min(1), published: z.boolean() }),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz id.",
    failureMessage: "Güncellenemedi.",
    handler: async (input, ctx) => {
      const updated = await prisma.service.update({
        where: { id: input.id },
        data: { published: Boolean(input.published) },
        select: { id: true, slug: true, published: true },
      });
      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "service.setPublished",
        entity: "Service",
        entityId: input.id,
        meta: { published: updated.published },
      });
      revalidateServicePaths([updated.slug]);
      return undefined;
    },
  });

  return action({ id, published: Boolean(published) });
}

export async function setServiceSortOrder(id: string, sortOrder: number) {
  const action = createSafeAction({
    scope: "admin.service.setSortOrder",
    schema: z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0).max(999_999) }),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Güncellenemedi.",
    handler: async (input, ctx) => {
      const updated = await prisma.service.update({
        where: { id: input.id },
        data: { sortOrder: Math.trunc(input.sortOrder) },
        select: { id: true, slug: true, sortOrder: true },
      });
      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "service.setSortOrder",
        entity: "Service",
        entityId: input.id,
        meta: { sortOrder: updated.sortOrder },
      });
      revalidateServicePaths([updated.slug]);
      return undefined;
    },
  });

  return action({ id, sortOrder: Number(sortOrder) });
}

/**
 * Kod içindeki varsayılan hizmet tanımlarını (galeri + detay) veritabanına aktarır.
 * Yalnızca kaydı olmayan slug'lar için kayıt oluşturur; mevcut kayıtlara dokunmaz.
 */
export async function syncMissingDefaultServicesFromContent() {
  const action = createSafeAction({
    scope: "admin.service.syncDefaults",
    schema: z.object({}),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz istek.",
    failureMessage: "Senkronize edilemedi.",
    handler: async (_input, ctx) => {
      let created = 0;
      let skipped = 0;
      const createdSlugs: string[] = [];

      for (let i = 0; i < SERVICES_GALLERY_TR.length; i++) {
        const g = SERVICES_GALLERY_TR[i]!;
        const detail = SERVICES_DETAIL[g.slug];
        const exists = await prisma.service.findUnique({ where: { slug: g.slug }, select: { id: true } });
        if (exists) {
          skipped++;
          continue;
        }
        if (!detail) continue;

        await prisma.service.create({
          data: {
            slug: detail.slug,
            title: detail.name,
            shortDescription: detail.shortDescription,
            heroImageUrl: detail.heroImageUrl,
            scope: JSON.stringify(detail.hizmetKapsami),
            process: JSON.stringify(detail.hizmetSureci),
            faq: JSON.stringify(
              detail.sss.map((x) => ({
                question: x.question,
                answer: x.answer,
              })),
            ),
            published: true,
            sortOrder: i,
          },
        });
        created++;
        createdSlugs.push(detail.slug);
      }

      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "service.syncDefaults",
        entity: "Service",
        entityId: "bulk",
        meta: { created, skipped },
      });

      revalidatePath("/");
      revalidatePath("/en");
      if (createdSlugs.length > 0) {
        revalidateServicePaths(createdSlugs);
      } else {
        revalidatePath("/admin/services");
        revalidateTag("public-services");
      }

      return { created, skipped } as const;
    },
  });

  return action({});
}
