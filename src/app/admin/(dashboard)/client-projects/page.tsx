import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStatusPill,
} from "@/components/admin/ui/AdminPageChrome";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PLANNING: "Planlama",
  PERMITTING: "Ruhsat",
  CONSTRUCTION: "İnşaat",
  INTERIOR: "İç mimari",
  COMPLETED: "Tamamlandı",
};

export default async function AdminClientProjectsPage() {
  const projects = await prisma.clientProject.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { members: true, stages: true, updates: true } },
    },
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Portal projeleri"
        description="Müşteri paneline özel işler — portfolyo CMS projelerinden ayrıdır."
        actions={<AdminPrimaryButton href="/admin/client-projects/new">Yeni portal projesi</AdminPrimaryButton>}
      />

      {projects.length === 0 ? (
        <AdminEmptyState
          title="Henüz portal projesi yok"
          hint="Müşteriye atayacağınız şantiyeyi / işi burada oluşturun; ardından aşama ve güncelleme ekleyin."
          actionHref="/admin/client-projects/new"
          actionLabel="İlk projeyi oluştur"
        />
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm transition-colors hover:bg-zinc-900/40"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-zinc-100">{p.title}</p>
                  <AdminStatusPill tone="accent">{STATUS_LABEL[p.status] ?? p.status}</AdminStatusPill>
                </div>
                <p className="mt-1 text-zinc-500">
                  {p._count.members} üye · {p._count.stages} aşama · {p._count.updates} güncelleme
                  {p.address ? ` · ${p.address}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/client-projects/${p.id}`}
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-600"
                >
                  Düzenle
                </Link>
                <Link
                  href={`/admin/client-projects/${p.id}/updates`}
                  className="rounded-lg border border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10 px-3 py-1.5 text-xs font-semibold text-[rgb(200,170,130)]"
                >
                  Güncellemeler
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
