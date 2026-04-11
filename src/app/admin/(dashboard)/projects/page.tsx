import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";

export default async function AdminProjectsPage() {
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  try {
    projects = await prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    /* DB yok */
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">Projeler</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Görseller için yalnızca yol veya tam URL kullanın; Next.js Image ile uyumludur.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950"
        >
          Yeni proje
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Başlık</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Slug</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Kategori</th>
              <th className="px-4 py-3 font-medium">Yayın</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                  Henüz proje yok veya veritabanı bağlı değil.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/80 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-200">{p.title}</td>
                  <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">{p.slug}</td>
                  <td className="hidden max-w-[200px] truncate px-4 py-3 text-zinc-500 lg:table-cell">
                    {p.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{p.published ? "Evet" : "Hayır"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        Düzenle
                      </Link>
                      <DeleteProjectButton id={p.id} title={p.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
