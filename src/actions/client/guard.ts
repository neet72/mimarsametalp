"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
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

/** Sayfa okumaları için — rate limit yok (RSC refresh 500 üretmesin). */
export async function requireClient() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/panel/giris");
  }

  const client = await prisma.clientUser.findFirst({
    where: { id: session.user.id, active: true },
  });
  if (!client) {
    redirect("/panel/giris");
  }

  return { session, client };
}
