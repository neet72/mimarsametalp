import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Müşterinin erişebildiği projeler — her zaman membership ile scoped. */
export async function listClientProjectsForUser(clientId: string) {
  return prisma.clientProject.findMany({
    where: { members: { some: { clientId } } },
    include: {
      stages: { orderBy: { orderIndex: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getClientProjectForUser(clientId: string, projectId: string) {
  return prisma.clientProject.findFirst({
    where: {
      id: projectId,
      members: { some: { clientId } },
    },
    include: {
      stages: { orderBy: { orderIndex: "asc" } },
    },
  });
}

export async function listPublishedUpdatesForUser(clientId: string) {
  return prisma.clientProjectUpdate.findMany({
    where: {
      isPublished: true,
      project: { members: { some: { clientId } } },
    },
    include: {
      media: { orderBy: { orderIndex: "asc" } },
      stage: true,
      project: { select: { id: true, title: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}
