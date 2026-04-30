"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { ProjectPublishedToggle, ProjectSortOrderInput } from "@/components/admin/ProjectQuickActions";
import { ActionMenu, ActionMenuItem } from "@/components/admin/ui/action-menu";
import { cn } from "@/lib/cn";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  published: boolean;
  sortOrder: number;
  imageUrls: string;
  createdAt: Date;
};

type SortKey = "createdAt" | "title" | "sortOrder";
type SortDir = "asc" | "desc";

function coverFromImageUrls(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0]) return parsed[0];
  } catch {
    /* ignore */
  }
  return "/images/hero-1.webp";
}

export function AdminProjectsTableClient({ items }: { items: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const next = [...items];
    next.sort((a, b) => {
      if (sortKey === "createdAt") {
        const av = new Date(a.createdAt).getTime();
        const bv = new Date(b.createdAt).getTime();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      } else if (sortKey === "title") {
        const av = a.title.toLocaleLowerCase("tr");
        const bv = b.title.toLocaleLowerCase("tr");
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      } else {
        const av = a.sortOrder ?? 0;
        const bv = b.sortOrder ?? 0;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
    });
    return next;
  }, [items, sortDir, sortKey]);

  const toggle = (key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir("desc");
        return key;
      }
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tablo</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggle("createdAt")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
              sortKey === "createdAt" ? "border-white/15 bg-white/5 text-zinc-100" : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
            )}
          >
            Tarih
            {sortKey === "createdAt" ? (
              sortDir === "asc" ? <ArrowUpNarrowWide className="h-4 w-4" aria-hidden /> : <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => toggle("title")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
              sortKey === "title" ? "border-white/15 bg-white/5 text-zinc-100" : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
            )}
          >
            Başlık
            {sortKey === "title" ? (
              sortDir === "asc" ? <ArrowUpNarrowWide className="h-4 w-4" aria-hidden /> : <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => toggle("sortOrder")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
              sortKey === "sortOrder" ? "border-white/15 bg-white/5 text-zinc-100" : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
            )}
          >
            Sıra
            {sortKey === "sortOrder" ? (
              sortDir === "asc" ? <ArrowUpNarrowWide className="h-4 w-4" aria-hidden /> : <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
            ) : null}
          </button>
        </div>
      </div>

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
          {sorted.map((p) => (
            <tr key={p.id} className="border-b border-zinc-800/80 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-14 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                    <Image src={coverFromImageUrls(p.imageUrls)} alt="" fill sizes="64px" className="object-cover object-center" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-200">{p.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{new Date(p.createdAt).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">{p.slug}</td>
              <td className="hidden max-w-[200px] truncate px-4 py-3 text-zinc-500 lg:table-cell">{p.category ?? "—"}</td>
              <td className="px-4 py-3">
                <ProjectPublishedToggle id={p.id} published={p.published} />
              </td>
              <td className="px-4 py-3 text-right">
                <ProjectSortOrderInput id={p.id} value={p.sortOrder} />
              </td>
              <td className="px-4 py-3 text-right">
                <ActionMenu label="Proje aksiyonları">
                  <Link key="edit" href={`/admin/projects/${p.id}/edit`} className="block">
                    <ActionMenuItem>
                      <Pencil className="h-4 w-4 text-zinc-300" aria-hidden />
                      Düzenle
                    </ActionMenuItem>
                  </Link>
                  <a key="public" href={`/projeler/${p.slug}`} target="_blank" rel="noreferrer" className="block">
                    <ActionMenuItem>
                      <ExternalLink className="h-4 w-4 text-zinc-300" aria-hidden />
                      Public’te gör
                    </ActionMenuItem>
                  </a>
                  <div key="divider" className="border-t border-zinc-800" />
                  <div key="delete" className="px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-300">
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Sil
                    </div>
                    <div className="mt-2 flex justify-end">
                      <DeleteProjectButton id={p.id} title={p.title} />
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

