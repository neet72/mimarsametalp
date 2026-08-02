import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminClientForm } from "@/components/admin/portal/AdminClientForm";
import { AdminEmptyState, AdminPageHeader, AdminStatusPill } from "@/components/admin/ui/AdminPageChrome";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const [clients, projects] = await Promise.all([
    prisma.clientUser.findMany({
      orderBy: { createdAt: "desc" },
      include: { projects: { select: { projectId: true } } },
    }),
    prisma.clientProject.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Müşteriler"
        description="Portal hesapları, geçici şifre, bildirim tercihleri ve proje ataması."
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Yeni hesap</h2>
          <p className="text-xs text-zinc-600">{projects.length} portal projesi seçilebilir</p>
        </div>
        <AdminClientForm mode="create" projects={projects} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Kayıtlı ({clients.length})
        </h2>
        {clients.length === 0 ? (
          <AdminEmptyState
            title="Henüz müşteri yok"
            hint="İlk hesabı yukarıdan oluşturun. Geçici şifre ekranda kopyalanır; e-posta varsa Resend ile de gider."
          />
        ) : (
          <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
            {clients.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-zinc-900/40"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-zinc-100">{c.fullName}</p>
                    <AdminStatusPill tone={c.active ? "ok" : "danger"}>
                      {c.active ? "aktif" : "pasif"}
                    </AdminStatusPill>
                    {c.mustChangePassword ? (
                      <AdminStatusPill tone="accent">şifre zorunlu</AdminStatusPill>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-zinc-500">
                    @{c.username}
                    {c.email ? ` · ${c.email}` : ""}
                    {` · ${c.projects.length} proje`}
                  </p>
                </div>
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-[rgb(200,170,130)] transition-colors hover:border-zinc-600"
                >
                  Düzenle
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
