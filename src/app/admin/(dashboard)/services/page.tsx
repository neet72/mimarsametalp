import Link from "next/link";
import { SERVICES_GALLERY as STATIC_SERVICE_GALLERY } from "@/content/services-gallery";
import { getAdminServices } from "@/lib/admin/services";
import { prisma } from "@/lib/db/prisma";
import { AdminServicesEmptyOrSync } from "@/components/admin/AdminServicesEmptyOrSync";
import { AdminServicesTableClient } from "@/components/admin/AdminServicesTableClient";
import { ServiceAdminGuide } from "@/components/admin/ServiceAdminGuide";

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

export default async function AdminServicesPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = asString(sp.q) ?? "";
  const published = (asString(sp.published) as "all" | "published" | "draft" | undefined) ?? "all";
  const page = Number(asString(sp.page) ?? "1") || 1;

  let data: Awaited<ReturnType<typeof getAdminServices>> | null = null;
  try {
    data = await getAdminServices({ page, pageSize: 20, q, published });
  } catch {
    /* DB yok */
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (published && published !== "all") baseParams.set("published", published);

  let missingCatalogEstimate = STATIC_SERVICE_GALLERY.length;
  try {
    const rows = await prisma.service.findMany({ select: { slug: true } });
    const have = new Set(rows.map((r) => r.slug));
    missingCatalogEstimate = STATIC_SERVICE_GALLERY.filter((g) => !have.has(g.slug)).length;
  } catch {
    /* DB yok */
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">Hizmetler</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Buradan hizmet sayfalarınızı yönetirsiniz. «Yeni hizmet» ile ekleyin; satırdaki menüden sitede açıp
            kontrol edin. Zorunlu alanlar azdır — önce taslak kaydedip sonra yayına almak güvenlidir.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm ring-1 ring-black/20"
        >
          + Yeni hizmet
        </Link>
      </div>

      <AdminServicesEmptyOrSync
        listEmpty={items.length === 0}
        missingCountEstimate={missingCatalogEstimate}
      />

      <form
        method="get"
        className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5 sm:max-w-md">
            <label htmlFor="admin-services-q" className="block text-xs font-medium text-zinc-400">
              Ara
            </label>
            <input
              id="admin-services-q"
              name="q"
              defaultValue={q}
              placeholder="Örn: mimari, iç mimar, slug…"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[rgb(166,124,82)]/40"
            />
            <p className="text-xs text-zinc-600">Başlık, web adresindeki kısa isim (slug) veya kısa açıklamada arar.</p>
          </div>
          <div className="w-full space-y-1.5 sm:w-56">
            <label htmlFor="admin-services-published" className="block text-xs font-medium text-zinc-400">
              Kimler görünsün?
            </label>
            <select
              id="admin-services-published"
              name="published"
              defaultValue={published}
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[rgb(166,124,82)]/40"
            >
              <option value="all">Tüm kayıtlar</option>
              <option value="published">Sitede görünenler (yayında)</option>
              <option value="draft">Taslaklar (sadece panel)</option>
            </select>
          </div>
        </div>
        <button type="submit" className="h-10 shrink-0 rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950">
          Listeyi güncelle
        </button>
      </form>

      {items.length > 0 ? <AdminServicesTableClient items={items} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
        <p>
          Sayfa <span className="text-zinc-200">{currentPage}</span> / <span className="text-zinc-200">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : 0}
            href={`/admin/services?${withSearchParams(baseParams, { page: currentPage - 1 })}`}
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
            href={`/admin/services?${withSearchParams(baseParams, { page: currentPage + 1 })}`}
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

      <ServiceAdminGuide variant="full" />
    </div>
  );
}
