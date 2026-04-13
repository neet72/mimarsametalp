import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AdminProjectsQuery = {
  page: number;
  pageSize: number;
  q?: string;
  published?: "all" | "published" | "draft";
};

export async function getAdminProjects(query: AdminProjectsQuery) {
  const pageSize = Math.min(Math.max(query.pageSize, 5), 50);
  const page = Math.max(query.page, 1);
  const skip = (page - 1) * pageSize;

  const q = query.q?.trim();
  const published = query.published ?? "all";

  const where: Prisma.ProjectWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { slug: { contains: q } },
            { category: { contains: q } },
          ],
        }
      : {}),
    ...(published === "all" ? {} : { published: published === "published" }),
  };

  const [total, items] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        published: true,
        sortOrder: true,
        imageUrls: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

