"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/slugify";
import { ActionError, createSafeAction } from "@/lib/actions/safe-action";
import { logger } from "@/lib/observability/logger";
import { z } from "zod";
import {
  adminProjectCreateSchema,
  adminProjectUpdateSchema,
  parseImageUrls,
} from "@/lib/validations/admin-project";
import { auditAdmin } from "@/lib/observability/audit";
import { requireAdmin } from "./guard";

export async function createProject(formData: FormData) {
  const raw = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    status: String(formData.get("status") ?? "").trim() || undefined,
    year: formData.get("year") ? Number(formData.get("year")) : undefined,
    location: String(formData.get("location") ?? "").trim() || undefined,
    areaM2: formData.get("areaM2") ? Number(formData.get("areaM2")) : undefined,
    imageUrlsText: String(formData.get("imageUrlsText") ?? ""),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };

  const action = createSafeAction({
    scope: "admin.project.create",
    schema: adminProjectCreateSchema,
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    toFieldErrors: (err) => err.flatten().fieldErrors,
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Kayıt oluşturulamadı.",
    handler: async (input, ctx) => {
      const urls = parseImageUrls(input.imageUrlsText);
      const slug = (input.slug && input.slug.length > 0 ? input.slug : slugify(input.title)).toLowerCase();

      try {
        await prisma.project.create({
          data: {
            title: input.title,
            slug,
            category: input.category || null,
            description: input.description || null,
            status: input.status || null,
            year: input.year ?? null,
            location: input.location || null,
            areaM2: input.areaM2 ?? null,
            imageUrls: JSON.stringify(urls),
            published: input.published ?? false,
            sortOrder: input.sortOrder ?? 0,
          },
          select: { id: true },
        });
      } catch (e) {
        logger.warn({
          msg: "project create failed",
          scope: "admin.project.create",
          actor: ctx.actor,
          error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
        });
        throw new ActionError("Kayıt oluşturulamadı (slug benzersiz mi?).");
      }

      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "project.create",
        entity: "Project",
        entityId: slug,
        meta: { published: Boolean(input.published), sortOrder: input.sortOrder ?? 0 },
      });

      revalidatePath("/admin/projects");
      revalidatePath("/projeler");
      revalidateTag("public-projects");
      revalidateTag(`public-project:${slug}`);
      return undefined;
    },
  });

  return action(raw);
}

export async function updateProject(formData: FormData) {
  const raw = {
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    status: String(formData.get("status") ?? "").trim() || undefined,
    year: formData.get("year") ? Number(formData.get("year")) : undefined,
    location: String(formData.get("location") ?? "").trim() || undefined,
    areaM2: formData.get("areaM2") ? Number(formData.get("areaM2")) : undefined,
    imageUrlsText: String(formData.get("imageUrlsText") ?? ""),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };

  const action = createSafeAction({
    scope: "admin.project.update",
    schema: adminProjectUpdateSchema,
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    toFieldErrors: (err) => err.flatten().fieldErrors,
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Güncelleme başarısız.",
    handler: async (input, ctx) => {
      const urls = parseImageUrls(input.imageUrlsText);
      const slug = (input.slug && input.slug.length > 0 ? input.slug : slugify(input.title)).toLowerCase();

      try {
        await prisma.project.update({
          where: { id: input.id },
          data: {
            title: input.title,
            slug,
            category: input.category || null,
            description: input.description || null,
            status: input.status || null,
            year: input.year ?? null,
            location: input.location || null,
            areaM2: input.areaM2 ?? null,
            imageUrls: JSON.stringify(urls),
            published: input.published ?? false,
            sortOrder: input.sortOrder ?? 0,
          },
          select: { id: true },
        });
      } catch (e) {
        logger.warn({
          msg: "project update failed",
          scope: "admin.project.update",
          actor: ctx.actor,
          error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
        });
        throw new ActionError("Güncelleme başarısız.");
      }

      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "project.update",
        entity: "Project",
        entityId: input.id,
        meta: { slug, published: Boolean(input.published), sortOrder: input.sortOrder ?? 0 },
      });

      revalidatePath("/admin/projects");
      revalidatePath(`/admin/projects/${input.id}/edit`);
      revalidatePath("/projeler");
      revalidateTag("public-projects");
      revalidateTag(`public-project:${slug}`);
      return undefined;
    },
  });

  return action(raw);
}

export async function deleteProject(id: string) {
  const action = createSafeAction({
    scope: "admin.project.delete",
    schema: z.object({ id: z.string().min(1) }),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz id.",
    failureMessage: "Silinemedi.",
    handler: async (input, ctx) => {
      await prisma.project.delete({ where: { id: input.id }, select: { id: true } });
      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "project.delete",
        entity: "Project",
        entityId: input.id,
      });
      revalidatePath("/admin/projects");
      revalidatePath("/projeler");
      revalidateTag("public-projects");
      return undefined;
    },
  });

  return action({ id });
}

export async function setProjectPublished(id: string, published: boolean) {
  const action = createSafeAction({
    scope: "admin.project.setPublished",
    schema: z.object({ id: z.string().min(1), published: z.boolean() }),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz id.",
    failureMessage: "Güncellenemedi.",
    handler: async (input, ctx) => {
      const updated = await prisma.project.update({
        where: { id: input.id },
        data: { published: Boolean(input.published) },
        select: { id: true, slug: true, published: true },
      });
      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "project.setPublished",
        entity: "Project",
        entityId: input.id,
        meta: { published: updated.published },
      });
      revalidatePath("/admin/projects");
      revalidatePath("/projeler");
      revalidateTag("public-projects");
      revalidateTag(`public-project:${updated.slug}`);
      return undefined;
    },
  });

  return action({ id, published: Boolean(published) });
}

export async function setProjectSortOrder(id: string, sortOrder: number) {
  const action = createSafeAction({
    scope: "admin.project.setSortOrder",
    schema: z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0).max(999_999) }),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Güncellenemedi.",
    handler: async (input, ctx) => {
      const updated = await prisma.project.update({
        where: { id: input.id },
        data: { sortOrder: Math.trunc(input.sortOrder) },
        select: { id: true, slug: true, sortOrder: true },
      });
      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "project.setSortOrder",
        entity: "Project",
        entityId: input.id,
        meta: { sortOrder: updated.sortOrder },
      });
      revalidatePath("/admin/projects");
      revalidatePath("/projeler");
      revalidateTag("public-projects");
      revalidateTag(`public-project:${updated.slug}`);
      return undefined;
    },
  });

  return action({ id, sortOrder: Number(sortOrder) });
}
