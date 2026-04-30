"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Mail, ToggleLeft, ToggleRight } from "lucide-react";
import { MessageReadToggle } from "@/components/admin/MessageReadToggle";
import { ActionMenu, ActionMenuItem } from "@/components/admin/ui/action-menu";
import { cn } from "@/lib/cn";

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  body: string;
  read: boolean;
  createdAt: Date;
};

type SortDir = "asc" | "desc";

export function AdminMessagesListClient({ items }: { items: Row[] }) {
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const next = [...items];
    next.sort((a, b) => {
      const av = new Date(a.createdAt).getTime();
      const bv = new Date(b.createdAt).getTime();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return next;
  }, [items, sortDir]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Liste</p>
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
            "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
          )}
        >
          Tarih
          {sortDir === "asc" ? <ArrowUpNarrowWide className="h-4 w-4" aria-hidden /> : <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      {sorted.map((m) => (
        <article
          key={m.id}
          className={`rounded-xl border p-5 ${
            m.read ? "border-zinc-800 bg-zinc-950/30" : "border-[rgb(166,124,82)]/25 bg-zinc-950/60"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-100">
                {m.firstName} {m.lastName}
              </p>
              <a href={`mailto:${m.email}`} className="text-sm text-[rgb(200,170,130)] hover:underline">
                {m.email}
              </a>
              <p className="mt-1 text-xs text-zinc-500">
                {new Date(m.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <MessageReadToggle id={m.id} read={m.read} />
              <ActionMenu label="Mesaj aksiyonları">
                <a href={`mailto:${m.email}`} className="block">
                  <ActionMenuItem>
                    <Mail className="h-4 w-4 text-zinc-300" aria-hidden />
                    E-posta gönder
                  </ActionMenuItem>
                </a>
                <Link href={`/admin/messages?read=${m.read ? "unread" : "read"}`} className="block">
                  <ActionMenuItem>
                    {m.read ? <ToggleLeft className="h-4 w-4 text-zinc-300" aria-hidden /> : <ToggleRight className="h-4 w-4 text-zinc-300" aria-hidden />}
                    {m.read ? "Okunmamışları filtrele" : "Okunmuşları filtrele"}
                  </ActionMenuItem>
                </Link>
              </ActionMenu>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{m.body}</p>
        </article>
      ))}
    </div>
  );
}

