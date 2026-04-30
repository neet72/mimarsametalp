import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { FolderKanban, Inbox, MailOpen, Wrench } from "lucide-react";

export default async function AdminDashboardPage() {
  let projectCount = 0;
  let messageCount = 0;
  let unreadCount = 0;
  let serviceCount = 0;
  let recentProjects: Array<{ id: string; title: string; slug: string; createdAt: Date }> = [];
  let recentMessages: Array<{ id: string; firstName: string; lastName: string; email: string; read: boolean; createdAt: Date }> = [];

  try {
    [projectCount, serviceCount, messageCount, unreadCount, recentProjects, recentMessages] = await Promise.all([
      prisma.project.count(),
      prisma.service.count(),
      prisma.message.count(),
      prisma.message.count({ where: { read: false } }),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, createdAt: true },
      }),
      prisma.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, read: true, createdAt: true },
      }),
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/projects"
          className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-zinc-700"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[rgb(166,124,82)]/10 blur-2xl" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Projeler</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{projectCount}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200">
              <FolderKanban className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </Link>
        <Link
          href="/admin/services"
          className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-zinc-700"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-white/8 blur-2xl" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Hizmetler</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{serviceCount}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200">
              <Wrench className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </Link>
        <Link
          href="/admin/messages"
          className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-zinc-700"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[rgb(200,170,130)]/10 blur-2xl" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Mesajlar</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{messageCount}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200">
              <Inbox className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </Link>
        <Link
          href="/admin/messages?read=unread"
          className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-zinc-700"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-red-500/10 blur-2xl" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Okunmamış</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[rgb(200,170,130)]">{unreadCount}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200">
              <MailOpen className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Son Eklenen Projeler</p>
              <p className="mt-1 text-sm text-zinc-400">Hızlı erişim</p>
            </div>
            <Link href="/admin/projects" className="text-xs font-semibold text-[rgb(200,170,130)] hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentProjects.length === 0 ? (
              <p className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-8 text-center text-sm text-zinc-500">
                Veri yok.
              </p>
            ) : (
              recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/projects/${p.id}/edit`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2.5 transition-colors hover:bg-zinc-900/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">{p.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{p.createdAt.toLocaleDateString("tr-TR")}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                    düzenle
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Son Mesajlar</p>
              <p className="mt-1 text-sm text-zinc-400">En yeni talepler</p>
            </div>
            <Link href="/admin/messages" className="text-xs font-semibold text-[rgb(200,170,130)] hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentMessages.length === 0 ? (
              <p className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-8 text-center text-sm text-zinc-500">
                Veri yok.
              </p>
            ) : (
              recentMessages.map((m) => (
                <Link
                  key={m.id}
                  href="/admin/messages"
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2.5 transition-colors hover:bg-zinc-900/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{m.email}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      m.read ? "border-white/10 bg-white/5 text-zinc-300" : "border-[rgb(166,124,82)]/25 bg-[rgb(166,124,82)]/10 text-[rgb(200,170,130)]"
                    }`}
                  >
                    {m.read ? "okundu" : "yeni"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
