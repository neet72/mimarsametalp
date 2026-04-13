"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/slugify";
import {
  adminProjectCreateSchema,
  adminProjectUpdateSchema,
  parseImageUrls,
} from "@/lib/validations/admin-project";
import { auditAdmin } from "@/lib/observability/audit";
import { requireAdmin } from "./guard";

export async function createProject(formData: FormData) {
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

  const parsed = adminProjectCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Geçersiz veri.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const urls = parseImageUrls(parsed.data.imageUrlsText);
  const slug = (parsed.data.slug && parsed.data.slug.length > 0 ? parsed.data.slug : slugify(parsed.data.title)).toLowerCase();

  try {
    await prisma.project.create({
      data: {
        title: parsed.data.title,
        slug,
        category: parsed.data.category || null,
        description: parsed.data.description || null,
        status: parsed.data.status || null,
        year: parsed.data.year ?? null,
        location: parsed.data.location || null,
        areaM2: parsed.data.areaM2 ?? null,
        imageUrls: JSON.stringify(urls),
        published: parsed.data.published ?? false,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
    await auditAdmin({
      actor,
      action: "project.create",
      entity: "Project",
      entityId: slug,
      meta: { published: Boolean(parsed.data.published), sortOrder: parsed.data.sortOrder ?? 0 },
    });
  } catch (e) {
    console.error("[createProject]", e);
    return { ok: false as const, error: "Kayıt oluşturulamadı (slug benzersiz mi?)." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projeler");
  revalidateTag("public-projects");
  revalidateTag(`public-project:${slug}`);
  return { ok: true as const };
}

export async function updateProject(formData: FormData) {
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

  const parsed = adminProjectUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Geçersiz veri.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const urls = parseImageUrls(parsed.data.imageUrlsText);
  const slug = (parsed.data.slug && parsed.data.slug.length > 0 ? parsed.data.slug : slugify(parsed.data.title)).toLowerCase();

  try {
    await prisma.project.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        slug,
        category: parsed.data.category || null,
        description: parsed.data.description || null,
        status: parsed.data.status || null,
        year: parsed.data.year ?? null,
        location: parsed.data.location || null,
        areaM2: parsed.data.areaM2 ?? null,
        imageUrls: JSON.stringify(urls),
        published: parsed.data.published ?? false,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
    await auditAdmin({
      actor,
      action: "project.update",
      entity: "Project",
      entityId: parsed.data.id,
      meta: { slug, published: Boolean(parsed.data.published), sortOrder: parsed.data.sortOrder ?? 0 },
    });
  } catch (e) {
    console.error("[updateProject]", e);
    return { ok: false as const, error: "Güncelleme başarısız." };
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${parsed.data.id}/edit`);
  revalidatePath("/projeler");
  revalidateTag("public-projects");
  revalidateTag(`public-project:${slug}`);
  return { ok: true as const };
}

export async function deleteProject(id: string) {
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
  if (!id) return { ok: false as const, error: "Geçersiz id." };

  try {
    await prisma.project.delete({ where: { id } });
    await auditAdmin({
      actor,
      action: "project.delete",
      entity: "Project",
      entityId: id,
    });
  } catch (e) {
    console.error("[deleteProject]", e);
    return { ok: false as const, error: "Silinemedi." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projeler");
  revalidateTag("public-projects");
  return { ok: true as const };
}

export async function setProjectPublished(id: string, published: boolean) {
  let actor = "unknown";
  try {
    const session = await requireAdmin();
    actor = session.user.email ?? "unknown";
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      return { ok: false as const, error: "Çok fazla istek." };
    }
    throw e;
  }

  if (!id) return { ok: false as const, error: "Geçersiz id." };

  let updated;
  try {
    updated = await prisma.project.update({
      where: { id },
      data: { published: Boolean(published) },
      select: { id: true, slug: true, published: true },
    });
    await auditAdmin({
      actor,
      action: "project.setPublished",
      entity: "Project",
      entityId: id,
      meta: { published: updated.published },
    });
  } catch (e) {
    console.error("[setProjectPublished]", e);
    return { ok: false as const, error: "Güncellenemedi." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projeler");
  revalidateTag("public-projects");
  revalidateTag(`public-project:${updated.slug}`);
  return { ok: true as const };
}

export async function setProjectSortOrder(id: string, sortOrder: number) {
  let actor = "unknown";
  try {
    const session = await requireAdmin();
    actor = session.user.email ?? "unknown";
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      return { ok: false as const, error: "Çok fazla istek." };
    }
    throw e;
  }

  if (!id) return { ok: false as const, error: "Geçersiz id." };
  if (!Number.isFinite(sortOrder) || sortOrder < 0 || sortOrder > 999_999) {
    return { ok: false as const, error: "Geçersiz sıra." };
  }

  let updated;
  try {
    updated = await prisma.project.update({
      where: { id },
      data: { sortOrder: Math.trunc(sortOrder) },
      select: { id: true, slug: true, sortOrder: true },
    });
    await auditAdmin({
      actor,
      action: "project.setSortOrder",
      entity: "Project",
      entityId: id,
      meta: { sortOrder: updated.sortOrder },
    });
  } catch (e) {
    console.error("[setProjectSortOrder]", e);
    return { ok: false as const, error: "Güncellenemedi." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projeler");
  revalidateTag("public-projects");
  revalidateTag(`public-project:${updated.slug}`);
  return { ok: true as const };
}
