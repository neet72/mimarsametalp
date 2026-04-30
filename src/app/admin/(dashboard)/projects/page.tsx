import Link from "next/link";
import { getAdminProjects } from "@/lib/admin/projects";
import { AdminProjectsTableClient } from "@/components/admin/AdminProjectsTableClient";

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

      {items.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-12 text-center text-zinc-500">
          Henüz proje yok veya veritabanı bağlı değil.
        </p>
      ) : (
        <AdminProjectsTableClient items={items} />
      )}

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
