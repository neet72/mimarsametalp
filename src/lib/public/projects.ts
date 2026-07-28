import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { PROJECTS } from "@/data/projects";

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  status: string | null;
  year: number | null;
  location: string | null;
  titleEn: string | null;
  categoryEn: string | null;
  descriptionEn: string | null;
  statusEn: string | null;
  locationEn: string | null;
  areaM2: number | null;
  imageUrls: string[];
  updatedAt: Date;
};

function slugifyTitle(title: string): string {
  return title
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** DB boş/hatalıysa `src/data/projects.ts` portfolyosu (hizmet listesiyle aynı mantık). */
function staticFallbackProjects(): PublicProject[] {
  const updatedAt = new Date(0);
  return PROJECTS.map((p) => ({
    id: `static-${p.id}`,
    slug: slugifyTitle(p.title),
    title: p.title,
    category: p.category,
    description: p.description,
    status: null,
    year: null,
    location: null,
    titleEn: null,
    categoryEn: null,
    descriptionEn: null,
    statusEn: null,
    locationEn: null,
    areaM2: null,
    imageUrls: p.gallery.length > 0 ? p.gallery : [p.imageUrl],
    updatedAt,
  }));
}

function safeParseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function toPublicProject(row: {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  status: string | null;
  year: number | null;
  location: string | null;
  titleEn: string | null;
  categoryEn: string | null;
  descriptionEn: string | null;
  statusEn: string | null;
  locationEn: string | null;
  areaM2: number | null;
  imageUrls: string;
  updatedAt: Date;
}): PublicProject {
  const urls = safeParseJsonArray(row.imageUrls);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    status: row.status,
    year: row.year,
    location: row.location,
    titleEn: row.titleEn,
    categoryEn: row.categoryEn,
    descriptionEn: row.descriptionEn,
    statusEn: row.statusEn,
    locationEn: row.locationEn,
    areaM2: row.areaM2,
    imageUrls: urls,
    updatedAt: row.updatedAt,
  };
}

export const getPublicProjects = unstable_cache(
  async () => {
    try {
      const rows = await prisma.project.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          description: true,
          status: true,
          year: true,
          location: true,
          titleEn: true,
          categoryEn: true,
          descriptionEn: true,
          statusEn: true,
          locationEn: true,
          areaM2: true,
          imageUrls: true,
          updatedAt: true,
        },
      });
      if (rows.length === 0) return staticFallbackProjects();
      return rows.map(toPublicProject);
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          msg: "getPublicProjects failed — using static fallback",
          scope: "public.projects",
          error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
        }),
      );
      return staticFallbackProjects();
    }
  },
  ["public-projects:v4"],
  { revalidate: 60, tags: ["public-projects"] },
);

export const getPublicProjectBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      const normalized = slug.trim().toLowerCase();
      try {
        const row = await prisma.project.findFirst({
          where: { published: true, slug: normalized },
          select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            description: true,
            status: true,
            year: true,
            location: true,
            titleEn: true,
            categoryEn: true,
            descriptionEn: true,
            statusEn: true,
            locationEn: true,
            areaM2: true,
            imageUrls: true,
            updatedAt: true,
          },
        });
        if (row) return toPublicProject(row);
      } catch (error) {
        console.error(
          JSON.stringify({
            level: "error",
            msg: "getPublicProjectBySlug failed — trying static fallback",
            scope: "public.projects",
            slug: normalized,
            error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
          }),
        );
      }
      return staticFallbackProjects().find((p) => p.slug === normalized) ?? null;
    },
    [`public-project:${slug}:v4`],
    { revalidate: 60, tags: ["public-projects", `public-project:${slug}`] },
  )();
