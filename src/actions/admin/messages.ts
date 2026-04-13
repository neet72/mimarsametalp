"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";
import { requireAdmin } from "./guard";

export async function setMessageRead(id: string, read: boolean) {
  let actor = "unknown";
  try {
    const session = await requireAdmin();
    actor = session.user.email ?? "unknown";
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      return { ok: false as const };
    }
    throw e;
  }
  if (!id) return { ok: false as const };

  try {
    await prisma.message.update({
      where: { id },
      data: { read },
    });
    await auditAdmin({
      actor,
      action: "message.setRead",
      entity: "Message",
      entityId: id,
      meta: { read },
    });
  } catch {
    return { ok: false as const };
  }

  revalidatePath("/admin/messages");
  return { ok: true as const };
}
