import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Müşterinin erişebildiği projeler — her zaman membership ile scoped. */
export async function listClientProjectsForUser(clientId: string) {
  return prisma.clientProject.findMany({
    where: { members: { some: { clientId } } },
    include: {
      stages: { orderBy: { orderIndex: "asc" } },
      _count: { select: { updates: { where: { isPublished: true } } } },
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

export async function countPublishedUpdatesForUser(clientId: string) {
  return prisma.clientProjectUpdate.count({
    where: {
      isPublished: true,
      project: { members: { some: { clientId } } },
    },
  });
}

export async function listRecentUpdatesForUser(clientId: string, take = 3) {
  return prisma.clientProjectUpdate.findMany({
    where: {
      isPublished: true,
      project: { members: { some: { clientId } } },
    },
    select: {
      id: true,
      title: true,
      publishedAt: true,
      project: { select: { title: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export async function listClientRequestsForUser(clientId: string, take = 20) {
  return prisma.clientDeliveryRequest.findMany({
    where: { clientId },
    include: { project: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getAdminPortalBadges() {
  const [newRequests, unreadMessages] = await Promise.all([
    prisma.clientDeliveryRequest.count({ where: { status: "new" } }),
    prisma.message.count({ where: { read: false } }),
  ]);
  return { newRequests, unreadMessages };
}
