import { MessageReadToggle } from "@/components/admin/MessageReadToggle";
import Link from "next/link";
import { getAdminMessages } from "@/lib/admin/messages";

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

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = asString(sp.q) ?? "";
  const read = (asString(sp.read) as "all" | "read" | "unread" | undefined) ?? "all";
  const page = Number(asString(sp.page) ?? "1") || 1;

  let data:
    | Awaited<ReturnType<typeof getAdminMessages>>
    | null = null;
  try {
    data = await getAdminMessages({ page, pageSize: 15, q, read });
  } catch {
    /* DB yok */
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (read && read !== "all") baseParams.set("read", read);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">Mesajlar</h1>
        <p className="mt-1 text-sm text-zinc-500">İletişim formundan gelen talepler.</p>
      </div>

      <form method="get" className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name="q"
            defaultValue={q}
            placeholder="Ara: ad, soyad, e-posta…"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[rgb(166,124,82)]/40 sm:max-w-md"
          />
          <select
            name="read"
            defaultValue={read}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[rgb(166,124,82)]/40 sm:w-56"
          >
            <option value="all">Tümü</option>
            <option value="unread">Okunmamış</option>
            <option value="read">Okunmuş</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950"
        >
          Filtrele
        </button>
      </form>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-12 text-center text-zinc-500">
            Henüz mesaj yok veya veritabanı bağlı değil.
          </p>
        ) : (
          items.map((m) => (
            <article
              key={m.id}
              className={`rounded-xl border p-5 ${
                m.read ? "border-zinc-800 bg-zinc-950/30" : "border-[rgb(166,124,82)]/25 bg-zinc-950/60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-100">
                    {m.firstName} {m.lastName}
                  </p>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-[rgb(200,170,130)] hover:underline"
                  >
                    {m.email}
                  </a>
                  <p className="mt-1 text-xs text-zinc-500">
                    {m.createdAt.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
                <MessageReadToggle id={m.id} read={m.read} />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{m.body}</p>
            </article>
          ))
        )}
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
            href={`/admin/messages?${withSearchParams(baseParams, { page: currentPage - 1 })}`}
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
            href={`/admin/messages?${withSearchParams(baseParams, { page: currentPage + 1 })}`}
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
