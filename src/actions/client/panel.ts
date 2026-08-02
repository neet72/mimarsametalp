"use server";

import { z } from "zod";
import { requireClient } from "@/actions/client/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/security/password";
import { rateLimit } from "@/lib/security/rate-limit";
import { sendDeliveryRequestAdminEmail } from "@/lib/email/portal-emails";
import { auth } from "@/auth";

export const changeClientPassword = createSafeAction({
  scope: "client.password.change",
  schema: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "En az 8 karakter").max(72),
  }),
  authorize: async () => {
    const { client } = await requireClient({ allowMustChangePassword: true });
    return { actor: client.id };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const client = await prisma.clientUser.findUnique({ where: { id: ctx.actor } });
    if (!client) throw new ActionError("Oturum geçersiz.");

    const { compare } = await import("bcryptjs");
    const ok = await compare(input.currentPassword, client.passwordHash);
    if (!ok) throw new ActionError("Mevcut şifre hatalı.");

    const passwordHash = await hashPassword(input.newPassword);
    await prisma.clientUser.update({
      where: { id: client.id },
      data: { passwordHash, mustChangePassword: false },
    });

    return { mustChangePassword: false as const };
  },
});

export const updateClientPreferences = createSafeAction({
  scope: "client.preferences",
  schema: z.object({
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    notifyEmail: z.boolean(),
    notifySms: z.boolean(),
  }),
  authorize: async () => {
    const { client } = await requireClient();
    return { actor: client.id };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    await prisma.clientUser.update({
      where: { id: ctx.actor },
      data: {
        email: input.email ? input.email.toLowerCase() : null,
        phone: input.phone || null,
        notifyEmail: input.notifyEmail,
        notifySms: input.notifySms,
      },
    });
    return { ok: true as const };
  },
});

export const submitDeliveryRequest = createSafeAction({
  scope: "client.delivery.submit",
  schema: z.object({
    projectId: z.string().cuid(),
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(40),
    address: z.string().trim().min(5).max(2000),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  }),
  authorize: async () => {
    const { client } = await requireClient();
    const rl = rateLimit(`client-delivery:${client.id}`, 5, 60 * 60 * 1000);
    if (!rl.ok) throw new Error("RATE_LIMITED");
    return { actor: client.id };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const membership = await prisma.clientProjectMember.findUnique({
      where: {
        projectId_clientId: { projectId: input.projectId, clientId: ctx.actor! },
      },
      include: { project: { select: { title: true } } },
    });
    if (!membership) throw new ActionError("Bu projeye erişiminiz yok.");

    const row = await prisma.clientDeliveryRequest.create({
      data: {
        projectId: input.projectId,
        clientId: ctx.actor!,
        fullName: input.fullName,
        phone: input.phone,
        address: input.address,
        notes: input.notes || null,
        status: "new",
      },
    });

    void sendDeliveryRequestAdminEmail({
      projectTitle: membership.project.title,
      fullName: input.fullName,
      phone: input.phone,
      address: input.address,
      notes: input.notes,
    });

    return { id: row.id };
  },
});

/** JWT mustChangePassword bayrağını temizlemek için session tarafında kullanılır. */
export async function getClientSessionFlags() {
  const session = await auth();
  return {
    mustChangePassword: Boolean(session?.user?.mustChangePassword),
    role: session?.user?.role,
  };
}
