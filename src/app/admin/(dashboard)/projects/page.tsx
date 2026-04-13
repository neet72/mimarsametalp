import Link from "next/link";
import Image from "next/image";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { ProjectPublishedToggle, ProjectSortOrderInput } from "@/components/admin/ProjectQuickActions";
import { getAdminProjects } from "@/lib/admin/projects";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function withSearchParams(
  params: URLSearchParams,
  updates: Record<string, string | number | null | undefined>,
) {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(updates)) {
    if (v == null || v === "") next.delete(k);
    else next.set(k, String(v));
  }
  return next.toString();
}

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = asString(sp.q) ?? "";
  const published = (asString(sp.published) as "all" | "published" | "draft" | undefined) ?? "all";
  const page = Number(asString(sp.page) ?? "1") || 1;

  let data:
    | Awaited<ReturnType<typeof getAdminProjects>>
    | null = null;
  try {
    data = await getAdminProjects({ page, pageSize: 20, q, published });
  } catch {
    /* DB yok */
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (published && published !== "all") baseParams.set("published", published);

  function coverFromImageUrls(raw: string): string {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0]) return parsed[0];
    } catch {
      /* ignore */
    }
    return "/images/hero-1.webp";
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

      <form method="get" className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name="q"
            defaultValue={q}
            placeholder="Ara: başlık, slug, kategori…"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[rgb(166,124,82)]/40 sm:max-w-md"
          />
          <select
            name="published"
            defaultValue={published}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[rgb(166,124,82)]/40 sm:w-56"
          >
            <option value="all">Tümü</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950"
        >
          Filtrele
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Proje</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Slug</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Kategori</th>
              <th className="px-4 py-3 font-medium">Yayın</th>
              <th className="px-4 py-3 font-medium text-right">Sıra</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  Henüz proje yok veya veritabanı bağlı değil.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/80 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                        <Image
                          src={coverFromImageUrls(p.imageUrls)}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-200">{p.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {p.createdAt.toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">{p.slug}</td>
                  <td className="hidden max-w-[200px] truncate px-4 py-3 text-zinc-500 lg:table-cell">
                    {p.category ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ProjectPublishedToggle id={p.id} published={p.published} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProjectSortOrderInput id={p.id} value={p.sortOrder} />
                  </td>
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

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
        <p>
          Sayfa <span className="text-zinc-200">{currentPage}</span> /{" "}
          <span className="text-zinc-200">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : 0}
            href={`/admin/projects?${withSearchParams(baseParams, { page: currentPage - 1 })}`}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              currentPage <= 1
                ? "pointer-events-none border-zinc-800 text-zinc-700"
                : "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Önceki
          </Link>
          <Link
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : 0}
            href={`/admin/projects?${withSearchParams(baseParams, { page: currentPage + 1 })}`}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              currentPage >= totalPages
                ? "pointer-events-none border-zinc-800 text-zinc-700"
                : "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Sonraki
          </Link>
        </div>
      </div>
    </div>
  );
}
