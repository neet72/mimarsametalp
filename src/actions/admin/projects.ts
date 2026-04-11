"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/slugify";
import {
  adminProjectCreateSchema,
  adminProjectUpdateSchema,
  parseImageUrls,
} from "@/lib/validations/admin-project";
import { requireAdmin } from "./guard";

export async function createProject(formData: FormData) {
  await requireAdmin();

  const raw = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
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
        imageUrls: JSON.stringify(urls),
        published: parsed.data.published ?? false,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
  } catch (e) {
    console.error("[createProject]", e);
    return { ok: false as const, error: "Kayıt oluşturulamadı (slug benzersiz mi?)." };
  }

  revalidatePath("/admin/projects");
  return { ok: true as const };
}

export async function updateProject(formData: FormData) {
  await requireAdmin();

  const raw = {
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
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
        imageUrls: JSON.stringify(urls),
        published: parsed.data.published ?? false,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
  } catch (e) {
    console.error("[updateProject]", e);
    return { ok: false as const, error: "Güncelleme başarısız." };
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${parsed.data.id}/edit`);
  return { ok: true as const };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  if (!id) return { ok: false as const, error: "Geçersiz id." };

  try {
    await prisma.project.delete({ where: { id } });
  } catch (e) {
    console.error("[deleteProject]", e);
    return { ok: false as const, error: "Silinemedi." };
  }

  revalidatePath("/admin/projects");
  return { ok: true as const };
}
