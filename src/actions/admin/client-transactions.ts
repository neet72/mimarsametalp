"use server";

import { z } from "zod";
import { ClientTransactionType } from "@prisma/client";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";

const typeSchema = z.nativeEnum(ClientTransactionType);

function parseEventDate(v: string): Date {
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T12:00:00.000Z`);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new ActionError("Geçersiz tarih.");
  return d;
}

const amountSchema = z.coerce.number().positive("Tutar 0’dan büyük olmalı").max(1_000_000_000);

export const createClientProjectTransaction = createSafeAction({
  scope: "admin.client-transaction.create",
  schema: z.object({
    projectId: z.string().min(1),
    type: typeSchema,
    amount: amountSchema,
    eventDate: z.string().min(1, "Tarih gerekli"),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  invalidMessage: "Geçersiz hareket — alanları kontrol edin.",
  handler: async (input, ctx) => {
    const project = await prisma.clientProject.findUnique({
      where: { id: input.projectId },
      select: { id: true },
    });
    if (!project) throw new ActionError("Proje bulunamadı.");

    const row = await prisma.clientProjectTransaction.create({
      data: {
        projectId: input.projectId,
        type: input.type,
        amount: input.amount,
        eventDate: parseEventDate(input.eventDate),
        description: input.description?.trim() || "",
      },
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-transaction.create",
      entity: "ClientProjectTransaction",
      entityId: row.id,
    });

    return { id: row.id };
  },
});

export const updateClientProjectTransaction = createSafeAction({
  scope: "admin.client-transaction.update",
  schema: z.object({
    id: z.string().min(1),
    type: typeSchema,
    amount: amountSchema,
    eventDate: z.string().min(1),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    await prisma.clientProjectTransaction.update({
      where: { id: input.id },
      data: {
        type: input.type,
        amount: input.amount,
        eventDate: parseEventDate(input.eventDate),
        description: input.description?.trim() || "",
      },
    });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-transaction.update",
      entity: "ClientProjectTransaction",
      entityId: input.id,
    });
    return { id: input.id };
  },
});

export const deleteClientProjectTransaction = createSafeAction({
  scope: "admin.client-transaction.delete",
  schema: z.object({ id: z.string().min(1) }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    await prisma.clientProjectTransaction.delete({ where: { id: input.id } });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-transaction.delete",
      entity: "ClientProjectTransaction",
      entityId: input.id,
    });
    return { id: input.id };
  },
});
