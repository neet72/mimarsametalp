"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";
import { requireAdmin } from "./guard";
import { createSafeAction } from "@/lib/actions/safe-action";
import { z } from "zod";

export async function setMessageRead(id: string, read: boolean) {
  const action = createSafeAction({
    scope: "admin.message.setRead",
    schema: z.object({ id: z.string().min(1), read: z.boolean() }),
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz id.",
    failureMessage: "Güncellenemedi.",
    handler: async (input, ctx) => {
      await prisma.message.update({
        where: { id: input.id },
        data: { read: input.read },
        select: { id: true },
      });
      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "message.setRead",
        entity: "Message",
        entityId: input.id,
        meta: { read: input.read },
      });
      revalidatePath("/admin/messages");
      return undefined;
    },
  });

  return action({ id, read: Boolean(read) });
}
