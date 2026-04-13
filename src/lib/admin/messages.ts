import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AdminMessagesQuery = {
  page: number;
  pageSize: number;
  q?: string;
  read?: "all" | "read" | "unread";
};

export async function getAdminMessages(query: AdminMessagesQuery) {
  const pageSize = Math.min(Math.max(query.pageSize, 5), 50);
  const page = Math.max(query.page, 1);
  const skip = (page - 1) * pageSize;

  const q = query.q?.trim();
  const read = query.read ?? "all";

  const where: Prisma.MessageWhereInput = {
    ...(q
      ? {
          OR: [
            { email: { contains: q } },
            { firstName: { contains: q } },
            { lastName: { contains: q } },
          ],
        }
      : {}),
    ...(read === "all" ? {} : { read: read === "read" }),
  };

  const [total, items] = await Promise.all([
    prisma.message.count({ where }),
    prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
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

