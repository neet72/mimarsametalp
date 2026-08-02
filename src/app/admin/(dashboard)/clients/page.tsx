import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminClientForm } from "@/components/admin/portal/AdminClientForm";

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
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">Müşteriler</h1>
        <p className="mt-1 text-sm text-zinc-500">Portal hesapları, geçici şifre ve proje ataması.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Yeni müşteri</h2>
        <AdminClientForm mode="create" projects={projects} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Kayıtlı</h2>
        {clients.length === 0 ? (
          <p className="text-sm text-zinc-600">Henüz müşteri yok.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
            {clients.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-zinc-100">{c.fullName}</p>
                  <p className="text-zinc-500">
                    @{c.username}
                    {c.active ? "" : " · pasif"}
                  </p>
                </div>
                <Link href={`/admin/clients/${c.id}`} className="text-[rgb(166,124,82)] hover:underline">
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
