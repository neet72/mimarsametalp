"use server";

import { z } from "zod";
import { ClientProjectStatus, ClientStageStatus } from "@prisma/client";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";

const statusSchema = z.nativeEnum(ClientProjectStatus);
const stageStatusSchema = z.nativeEnum(ClientStageStatus);

export const createClientProject = createSafeAction({
  scope: "admin.client-project.create",
  schema: z.object({
    title: z.string().trim().min(2).max(200),
    address: z.string().trim().max(300).optional().or(z.literal("")),
    status: statusSchema.optional(),
    coverImageUrl: z.string().trim().max(2000).optional(),
    clientIds: z.array(z.string().cuid()).optional(),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const project = await prisma.clientProject.create({
      data: {
        title: input.title,
        address: input.address || null,
        status: input.status ?? ClientProjectStatus.PLANNING,
        coverImageUrl: input.coverImageUrl || null,
        members:
          input.clientIds && input.clientIds.length
            ? { create: input.clientIds.map((clientId) => ({ clientId })) }
            : undefined,
      },
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-project.create",
      entity: "ClientProject",
      entityId: project.id,
    });

    return { id: project.id };
  },
});

export const updateClientProject = createSafeAction({
  scope: "admin.client-project.update",
  schema: z.object({
    id: z.string().cuid(),
    title: z.string().trim().min(2).max(200),
    address: z.string().trim().max(300).optional().or(z.literal("")),
    status: statusSchema,
    coverImageUrl: z.string().trim().max(2000).optional(),
    clientIds: z.array(z.string().cuid()),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    await prisma.$transaction(async (tx) => {
      await tx.clientProject.update({
        where: { id: input.id },
        data: {
          title: input.title,
          address: input.address || null,
          status: input.status,
          coverImageUrl: input.coverImageUrl || null,
        },
      });
      await tx.clientProjectMember.deleteMany({ where: { projectId: input.id } });
      if (input.clientIds.length) {
        await tx.clientProjectMember.createMany({
          data: input.clientIds.map((clientId) => ({ projectId: input.id, clientId })),
        });
      }
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-project.update",
      entity: "ClientProject",
      entityId: input.id,
    });

    return { id: input.id };
  },
});

export const upsertClientProjectStage = createSafeAction({
  scope: "admin.client-project.stage.upsert",
  schema: z.object({
    id: z.string().cuid().optional(),
    projectId: z.string().cuid(),
    name: z.string().trim().min(1).max(120),
    orderIndex: z.number().int().min(0).max(999),
    status: stageStatusSchema,
    targetDate: z.string().datetime().optional().nullable(),
    completedDate: z.string().datetime().optional().nullable(),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const project = await prisma.clientProject.findUnique({
      where: { id: input.projectId },
      select: { id: true },
    });
    if (!project) throw new ActionError("Proje bulunamadı.");

    const data = {
      name: input.name,
      orderIndex: input.orderIndex,
      status: input.status,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      completedDate: input.completedDate ? new Date(input.completedDate) : null,
    };

    const stage = input.id
      ? await prisma.clientProjectStage.update({ where: { id: input.id }, data })
      : await prisma.clientProjectStage.create({
          data: { ...data, projectId: input.projectId },
        });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: input.id ? "client-project.stage.update" : "client-project.stage.create",
      entity: "ClientProjectStage",
      entityId: stage.id,
    });

    return { id: stage.id };
  },
});

export const deleteClientProjectStage = createSafeAction({
  scope: "admin.client-project.stage.delete",
  schema: z.object({ id: z.string().cuid() }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    await prisma.clientProjectStage.delete({ where: { id: input.id } });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-project.stage.delete",
      entity: "ClientProjectStage",
      entityId: input.id,
    });
    return { id: input.id };
  },
});

export const reorderClientProjectStages = createSafeAction({
  scope: "admin.client-project.stage.reorder",
  schema: z.object({
    projectId: z.string().cuid(),
    orderedIds: z.array(z.string().cuid()).min(1),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input) => {
    await prisma.$transaction(
      input.orderedIds.map((id, index) =>
        prisma.clientProjectStage.update({
          where: { id },
          data: { orderIndex: index },
        }),
      ),
    );
    return { ok: true as const };
  },
});
