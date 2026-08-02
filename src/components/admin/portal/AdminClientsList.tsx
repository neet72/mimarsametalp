"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteClientUser } from "@/actions/admin/clients";
import { AdminConfirmDeleteButton } from "@/components/admin/portal/AdminConfirmDeleteButton";
import { AdminEmptyState, AdminStatusPill } from "@/components/admin/ui/AdminPageChrome";

type ClientRow = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  phone: string | null;
  adminVisiblePassword: string | null;
  lastLoginAt: string | null;
  active: boolean;
  projectCount: number;
};

export function AdminClientsList({ clients }: { clients: ClientRow[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "never" | "inactive">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return clients.filter((c) => {
      if (filter === "active" && !c.active) return false;
      if (filter === "inactive" && c.active) return false;
      if (filter === "never" && c.lastLoginAt) return false;
      if (!needle) return true;
      const hay = `${c.fullName} ${c.username} ${c.email ?? ""} ${c.phone ?? ""}`.toLocaleLowerCase("tr");
      return hay.includes(needle);
    });
  }, [clients, q, filter]);

  if (clients.length === 0) {
    return (
      <AdminEmptyState
        title="Henüz müşteri yok"
        hint="İlk hesabı yukarıdan oluşturun. Şifreyi siz belirlersiniz; ekranda görünür kalır."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block min-w-0 flex-1 text-sm sm:max-w-sm">
          <span className="sr-only">Müşteri ara</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ad, kullanıcı adı, e-posta, telefon…"
            className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(166,124,82)]/40"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtre">
          {(
            [
              ["all", "Tümü"],
              ["active", "Aktif"],
              ["never", "Giriş yok"],
              ["inactive", "Pasif"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={
                filter === id
                  ? "inline-flex min-h-10 items-center rounded-lg border border-[rgb(166,124,82)]/40 bg-[rgb(166,124,82)]/10 px-3 text-xs font-semibold text-[rgb(200,170,130)]"
                  : "inline-flex min-h-10 items-center rounded-lg border border-zinc-800 px-3 text-xs font-semibold text-zinc-400 hover:border-zinc-600"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-600" aria-live="polite">
        {filtered.length} / {clients.length} kayıt
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Filtreye uyan müşteri yok.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-zinc-900/40"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-zinc-100">{c.fullName}</p>
                  <AdminStatusPill tone={c.active ? "ok" : "danger"}>
                    {c.active ? "aktif" : "pasif"}
                  </AdminStatusPill>
                  {!c.lastLoginAt ? <AdminStatusPill tone="accent">giriş yok</AdminStatusPill> : null}
                </div>
                <p className="mt-1 truncate text-zinc-500">
                  @{c.username}
                  {c.email ? ` · ${c.email}` : ""}
                  {c.phone ? ` · ${c.phone}` : ""}
                  {c.adminVisiblePassword ? ` · şifre: ${c.adminVisiblePassword}` : ""}
                  {c.lastLoginAt
                    ? ` · giriş: ${new Date(c.lastLoginAt).toLocaleString("tr-TR")}`
                    : ""}
                  {` · ${c.projectCount} proje`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="inline-flex min-h-10 items-center rounded-lg border border-zinc-800 px-3 text-xs font-semibold text-[rgb(200,170,130)] transition-colors hover:border-zinc-600"
                >
                  Düzenle
                </Link>
                <AdminConfirmDeleteButton
                  confirmText={`“${c.fullName}” müşterisi silinsin mi? İstekler ve üyelikler de silinir.`}
                  successTitle="Müşteri silindi"
                  onDelete={async () => {
                    const r = await deleteClientUser({ id: c.id });
                    return r.ok ? { ok: true } : { ok: false, error: r.error };
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
