"use server";

import { z } from "zod";
import { ClientProjectStatus, ClientStageStatus } from "@prisma/client";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";

const statusSchema = z.nativeEnum(ClientProjectStatus);
const stageStatusSchema = z.nativeEnum(ClientStageStatus);

const optionalText = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z.union([z.literal(""), z.string().max(2000)]),
);

const idList = z.array(z.string().min(1));

export const createClientProject = createSafeAction({
  scope: "admin.client-project.create",
  schema: z.object({
    title: z.string().trim().min(2, "Başlık gerekli").max(200),
    address: optionalText,
    status: statusSchema.optional(),
    coverImageUrl: optionalText,
    clientIds: idList.optional(),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  invalidMessage: "Geçersiz veri — başlık ve alanları kontrol edin.",
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
    id: z.string().min(1),
    title: z.string().trim().min(2).max(200),
    address: optionalText,
    status: statusSchema,
    coverImageUrl: optionalText,
    clientIds: idList,
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  invalidMessage: "Geçersiz veri — alanları kontrol edin.",
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

function parseOptionalDate(v: string | null | undefined): Date | null {
  if (!v || !String(v).trim()) return null;
  const s = String(v).trim();
  // HTML date → YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T12:00:00.000Z`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const optionalDateInput = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.union([z.string(), z.null()]).optional(),
);

export const upsertClientProjectStage = createSafeAction({
  scope: "admin.client-project.stage.upsert",
  schema: z.object({
    id: z.string().min(1).optional(),
    projectId: z.string().min(1),
    name: z.string().trim().min(1).max(120),
    orderIndex: z.coerce.number().int().min(0).max(999),
    status: stageStatusSchema,
    targetDate: optionalDateInput,
    completedDate: optionalDateInput,
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  invalidMessage: "Aşama verisi geçersiz.",
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
      targetDate: parseOptionalDate(input.targetDate ?? null),
      completedDate: parseOptionalDate(input.completedDate ?? null),
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
  schema: z.object({ id: z.string().min(1) }),
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
    projectId: z.string().min(1),
    orderedIds: z.array(z.string().min(1)).min(1),
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

export const deleteClientProject = createSafeAction({
  scope: "admin.client-project.delete",
  schema: z.object({ id: z.string().min(1) }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    const existing = await prisma.clientProject.findUnique({
      where: { id: input.id },
      select: { id: true, title: true },
    });
    if (!existing) throw new ActionError("Proje bulunamadı.");

    await prisma.clientProject.delete({ where: { id: input.id } });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-project.delete",
      entity: "ClientProject",
      entityId: input.id,
    });
    return { id: input.id, title: existing.title };
  },
});
