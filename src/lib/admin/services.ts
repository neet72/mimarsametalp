import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AdminServicesQuery = {
  page: number;
  pageSize: number;
  q?: string;
  published?: "all" | "published" | "draft";
};

export async function getAdminServices(query: AdminServicesQuery) {
  const pageSize = Math.min(Math.max(query.pageSize, 5), 50);
  const page = Math.max(query.page, 1);
  const skip = (page - 1) * pageSize;

  const q = query.q?.trim();
  const published = query.published ?? "all";

  const where: Prisma.ServiceWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { slug: { contains: q } },
            { shortDescription: { contains: q } },
          ],
        }
      : {}),
    ...(published === "all" ? {} : { published: published === "published" }),
  };

  const [total, items] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        heroImageUrl: true,
        published: true,
        sortOrder: true,
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
