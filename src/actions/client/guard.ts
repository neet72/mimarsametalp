"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/security/rate-limit";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentClient() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    return null;
  }

  const client = await prisma.clientUser.findFirst({
    where: { id: session.user.id, active: true },
  });
  return client;
}

export async function requireClient(opts?: { allowMustChangePassword?: boolean }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/panel/giris");
  }

  if (session.user.mustChangePassword && !opts?.allowMustChangePassword) {
    redirect("/panel/sifre");
  }

  const rl = rateLimit(`client-action:${session.user.id}`, 40, 60 * 1000);
  if (!rl.ok) {
    throw new Error("RATE_LIMITED");
  }

  const client = await prisma.clientUser.findFirst({
    where: { id: session.user.id, active: true },
  });
  if (!client) {
    redirect("/panel/giris");
  }

  return { session, client };
}
