import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboardPage() {
  let projectCount = 0;
  let messageCount = 0;
  let unreadCount = 0;

  try {
    [projectCount, messageCount, unreadCount] = await Promise.all([
      prisma.project.count(),
      prisma.message.count(),
      prisma.message.count({ where: { read: false } }),
    ]);
  } catch {
    /* DB yok veya migrate edilmemiş */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">Özet</h1>
        <p className="mt-1 text-sm text-zinc-500">Yönetim paneline hoş geldiniz.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/projects"
          className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-zinc-700"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Projeler</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{projectCount}</p>
        </Link>
        <Link
          href="/admin/messages"
          className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-zinc-700"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Mesajlar</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{messageCount}</p>
        </Link>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Okunmamış</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[rgb(200,170,130)]">
            {unreadCount}
          </p>
        </div>
      </div>
    </div>
  );
}
