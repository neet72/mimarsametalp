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
    areaM2: row.areaM2,
    imageUrls: urls,
    updatedAt: row.updatedAt,
  };
}

export const getPublicProjects = unstable_cache(
  async () => {
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
        areaM2: true,
        imageUrls: true,
        updatedAt: true,
      },
    });
    return rows.map(toPublicProject);
  },
  ["public-projects:v1"],
  { revalidate: 60, tags: ["public-projects"] },
);

export const getPublicProjectBySlug = (slug: string) =>
  unstable_cache(
    async () => {
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
          areaM2: true,
          imageUrls: true,
          updatedAt: true,
        },
      });
      return row ? toPublicProject(row) : null;
    },
    [`public-project:${slug}:v1`],
    { revalidate: 60, tags: ["public-projects", `public-project:${slug}`] },
  )();

