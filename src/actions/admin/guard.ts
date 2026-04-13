"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/security/admin";
import { rateLimit } from "@/lib/security/rate-limit";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/admin/login");
  }

  // Admin action flood koruması — kullanıcı başına 60sn'de 40 istek.
  const rl = rateLimit(`admin-action:${session.user.email}`, 40, 60 * 1000);
  if (!rl.ok) {
    throw new Error("RATE_LIMITED");
  }

  return session;
}
