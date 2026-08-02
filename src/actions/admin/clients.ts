"use server";

import { z } from "zod";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { generateTempPassword, hashPassword } from "@/lib/security/password";
import { sendClientTempPasswordEmail } from "@/lib/email/portal-emails";
import { auditAdmin } from "@/lib/observability/audit";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "En az 3 karakter")
  .max(40)
  .regex(/^[a-z0-9._-]+$/i, "Sadece harf, rakam, . _ -");

export const createClientUser = createSafeAction({
  scope: "admin.client.create",
  schema: z.object({
    fullName: z.string().trim().min(2).max(120),
    username: usernameSchema,
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    notifyEmail: z.boolean().optional(),
    notifySms: z.boolean().optional(),
    projectIds: z.array(z.string().cuid()).optional(),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const username = input.username.toLowerCase();
    const exists = await prisma.clientUser.findUnique({ where: { username }, select: { id: true } });
    if (exists) throw new ActionError("Bu kullanıcı adı zaten kullanılıyor.");

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const client = await prisma.clientUser.create({
      data: {
        fullName: input.fullName,
        username,
        email: input.email ? input.email.toLowerCase() : null,
        phone: input.phone || null,
        passwordHash,
        mustChangePassword: true,
        notifyEmail: input.notifyEmail ?? true,
        notifySms: input.notifySms ?? true,
        projects:
          input.projectIds && input.projectIds.length
            ? { create: input.projectIds.map((projectId) => ({ projectId })) }
            : undefined,
      },
    });

    if (client.email) {
      await sendClientTempPasswordEmail({
        to: client.email,
        fullName: client.fullName,
        username: client.username,
        tempPassword,
      });
    }

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client.create",
      entity: "ClientUser",
      entityId: client.id,
    });

    return { id: client.id, username: client.username, tempPassword };
  },
});

export const updateClientUser = createSafeAction({
  scope: "admin.client.update",
  schema: z.object({
    id: z.string().cuid(),
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    notifyEmail: z.boolean(),
    notifySms: z.boolean(),
    active: z.boolean(),
    projectIds: z.array(z.string().cuid()),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    await prisma.$transaction(async (tx) => {
      await tx.clientUser.update({
        where: { id: input.id },
        data: {
          fullName: input.fullName,
          email: input.email ? input.email.toLowerCase() : null,
          phone: input.phone || null,
          notifyEmail: input.notifyEmail,
          notifySms: input.notifySms,
          active: input.active,
        },
      });
      await tx.clientProjectMember.deleteMany({ where: { clientId: input.id } });
      if (input.projectIds.length) {
        await tx.clientProjectMember.createMany({
          data: input.projectIds.map((projectId) => ({ projectId, clientId: input.id })),
        });
      }
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client.update",
      entity: "ClientUser",
      entityId: input.id,
    });

    return { id: input.id };
  },
});

export const resetClientPassword = createSafeAction({
  scope: "admin.client.reset-password",
  schema: z.object({ id: z.string().cuid() }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    const client = await prisma.clientUser.findUnique({ where: { id: input.id } });
    if (!client) throw new ActionError("Müşteri bulunamadı.");

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    await prisma.clientUser.update({
      where: { id: client.id },
      data: { passwordHash, mustChangePassword: true },
    });

    if (client.email) {
      const sent = await sendClientTempPasswordEmail({
        to: client.email,
        fullName: client.fullName,
        username: client.username,
        tempPassword,
      });
      if (!sent.ok) {
        // Şifre yine de değişti; admin kopyalayabilir
      }
    }

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client.reset-password",
      entity: "ClientUser",
      entityId: client.id,
    });

    return { tempPassword, emailSent: Boolean(client.email) };
  },
});
