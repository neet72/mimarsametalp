import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

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
}) : PublicProject {
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
      return rows.map(toPublicProject);
    } catch (error) {
      // Üretim DB’sinde kolon/migration eksikse sayfa 500 olmasın (hizmet listesi gibi)
      console.error(
        JSON.stringify({
          level: "error",
          msg: "getPublicProjects failed",
          scope: "public.projects",
          error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
        }),
      );
      return [];
    }
  },
  ["public-projects:v3"],
  { revalidate: 60, tags: ["public-projects"] },
);

export const getPublicProjectBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      try {
        const row = await prisma.project.findFirst({
          where: { published: true, slug },
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
        return row ? toPublicProject(row) : null;
      } catch (error) {
        console.error(
          JSON.stringify({
            level: "error",
            msg: "getPublicProjectBySlug failed",
            scope: "public.projects",
            slug,
            error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
          }),
        );
        return null;
      }
    },
    [`public-project:${slug}:v3`],
    { revalidate: 60, tags: ["public-projects", `public-project:${slug}`] },
  )();

