"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { DeleteServiceButton } from "@/components/admin/DeleteServiceButton";
import { ServicePublishedToggle, ServiceSortOrderInput } from "@/components/admin/ServiceQuickActions";
import { ActionMenu, ActionMenuItem } from "@/components/admin/ui/action-menu";
import { cn } from "@/lib/cn";
import { shouldUnoptimizeImage } from "@/lib/media/next-image";

type Row = {
  id: string;
  slug: string;
  title: string;
  heroImageUrl: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
};

type SortKey = "createdAt" | "title" | "sortOrder";
type SortDir = "asc" | "desc";

function coverUrl(url: string | null | undefined): string {
  const u = url?.trim();
  if (u) return u;
  return "/images/hero-1.webp";
}

export function AdminServicesTableClient({ items }: { items: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("sortOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const next = [...items];
    next.sort((a, b) => {
      if (sortKey === "createdAt") {
        const av = new Date(a.createdAt).getTime();
        const bv = new Date(b.createdAt).getTime();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      if (sortKey === "title") {
        const av = a.title.toLocaleLowerCase("tr");
        const bv = b.title.toLocaleLowerCase("tr");
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      const av = a.sortOrder ?? 0;
      const bv = b.sortOrder ?? 0;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return next;
  }, [items, sortDir, sortKey]);

  const toggle = (key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir(key === "sortOrder" ? "asc" : "desc");
        return key;
      }
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <p className="border-b border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm leading-relaxed text-zinc-400">
        <span className="font-medium text-zinc-300">Nasıl okunur?</span> Satır menüsünden «Düzenle» ile içeriği
        değiştirin. «Yayında» düğmesi ziyaretçinin görüp görmeyeceğini belirler. «Sıra» kutusuna sayı yazıp
        «Kaydet»e basın — küçük sayı listede daha üstte durur (aynı sayılarda tarih de devreye girer).
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Kayıtlar</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggle("createdAt")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
              sortKey === "createdAt"
                ? "border-white/15 bg-white/5 text-zinc-100"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
            )}
          >
            Tarih
            {sortKey === "createdAt" ? (
              sortDir === "asc" ? (
                <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
              )
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => toggle("title")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
              sortKey === "title"
                ? "border-white/15 bg-white/5 text-zinc-100"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
            )}
          >
            Başlık
            {sortKey === "title" ? (
              sortDir === "asc" ? (
                <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
              )
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => toggle("sortOrder")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
              sortKey === "sortOrder"
                ? "border-white/15 bg-white/5 text-zinc-100"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
            )}
          >
            Sıra
            {sortKey === "sortOrder" ? (
              sortDir === "asc" ? (
                <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
              )
            ) : null}
          </button>
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3 font-medium">Hizmet</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Slug</th>
            <th className="px-4 py-3 font-medium">Yayın</th>
            <th className="px-4 py-3 font-medium text-right">Sıra</th>
            <th className="px-4 py-3 font-medium text-right">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.id} className="border-b border-zinc-800/80 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-14 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                    <Image
                      src={coverUrl(s.heroImageUrl)}
                      alt={`${s.title} — önizleme`}
                      fill
                      sizes="64px"
                      unoptimized={shouldUnoptimizeImage(coverUrl(s.heroImageUrl))}
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-200">{s.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">{s.slug}</td>
              <td className="px-4 py-3">
                <ServicePublishedToggle id={s.id} published={s.published} />
              </td>
              <td className="px-4 py-3 text-right">
                <ServiceSortOrderInput id={s.id} value={s.sortOrder} />
              </td>
              <td className="px-4 py-3 text-right">
                <ActionMenu label="Hizmet aksiyonları">
                  <Link key="edit" href={`/admin/services/${s.id}/edit`} className="block">
                    <ActionMenuItem>
                      <Pencil className="h-4 w-4 text-zinc-300" aria-hidden />
                      Düzenle
                    </ActionMenuItem>
                  </Link>
                  <a key="public-tr" href={`/hizmetlerimiz/${s.slug}`} target="_blank" rel="noreferrer" className="block">
                    <ActionMenuItem>
                      <ExternalLink className="h-4 w-4 text-zinc-300" aria-hidden />
                      TR sitede aç
                    </ActionMenuItem>
                  </a>
                  <a
                    key="public-en"
                    href={`/en/hizmetlerimiz/${s.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <ActionMenuItem>
                      <ExternalLink className="h-4 w-4 text-zinc-300" aria-hidden />
                      EN sitede aç
                    </ActionMenuItem>
                  </a>
                  <div key="divider" className="border-t border-zinc-800" />
                  <div key="delete" className="px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-300">
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Sil
                    </div>
                    <div className="mt-2 flex justify-end">
                      <DeleteServiceButton id={s.id} title={s.title} />
                    </div>
                  </div>
                </ActionMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
