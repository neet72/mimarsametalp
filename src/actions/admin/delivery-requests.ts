"use server";

import { z } from "zod";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";

export const updateDeliveryRequestStatus = createSafeAction({
  scope: "admin.delivery.update-status",
  schema: z.object({
    id: z.string().cuid(),
    status: z.enum(["new", "in_progress", "done", "cancelled"]),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    const row = await prisma.clientDeliveryRequest.findUnique({ where: { id: input.id } });
    if (!row) throw new ActionError("Talep bulunamadı.");

    await prisma.clientDeliveryRequest.update({
      where: { id: input.id },
      data: { status: input.status },
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "delivery.update-status",
      entity: "ClientDeliveryRequest",
      entityId: input.id,
      meta: { status: input.status },
    });

    return { id: input.id };
  },
});
