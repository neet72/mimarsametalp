"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "./guard";

export async function setMessageRead(id: string, read: boolean) {
  await requireAdmin();
  if (!id) return { ok: false as const };

  try {
    await prisma.message.update({
      where: { id },
      data: { read },
    });
  } catch {
    return { ok: false as const };
  }

  revalidatePath("/admin/messages");
  return { ok: true as const };
}
