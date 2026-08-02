import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClientProjectsPage() {
  const projects = await prisma.clientProject.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { members: true, stages: true, updates: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
            Müşteri projeleri
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Portal projeleri (portfolyo CMS’den ayrı).</p>
        </div>
        <Link
          href="/admin/client-projects/new"
          className="rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950"
        >
          Yeni proje
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-zinc-600">Henüz müşteri projesi yok.</p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-zinc-100">{p.title}</p>
                <p className="text-zinc-500">
                  {p.status} · {p._count.members} üye · {p._count.stages} aşama · {p._count.updates} güncelleme
                </p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/client-projects/${p.id}`} className="text-[rgb(166,124,82)] hover:underline">
                  Düzenle
                </Link>
                <Link
                  href={`/admin/client-projects/${p.id}/updates`}
                  className="text-zinc-400 hover:underline"
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
