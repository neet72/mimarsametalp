"use client";

import Link from "next/link";
import { deleteClientProjectUpdate } from "@/actions/admin/client-updates";
import { AdminConfirmDeleteButton } from "@/components/admin/portal/AdminConfirmDeleteButton";
import { AdminStatusPill } from "@/components/admin/ui/AdminPageChrome";
import { Pencil } from "lucide-react";

type UpdateRow = {
  id: string;
  title: string;
  isPublished: boolean;
  eventDate?: string | null;
};

export function AdminClientUpdatesList({
  projectId,
  updates,
}: {
  projectId: string;
  updates: UpdateRow[];
}) {
  if (updates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-10 text-center text-sm text-zinc-500">
        Henüz kayıt yok.
      </p>
    );
  }

  return (
    <ul className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-zinc-800 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-zinc-800">
      {updates.map((u) => (
        <li
          key={u.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-4 sm:py-3.5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <p className="truncate font-medium text-zinc-100">{u.title}</p>
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusPill tone={u.isPublished ? "ok" : "neutral"}>
                  {u.isPublished ? "Yayında" : "Taslak"}
                </AdminStatusPill>
                {u.eventDate ? (
                  <span className="text-xs text-zinc-500">
                    {new Date(u.eventDate).toLocaleDateString("tr-TR")}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/client-projects/${projectId}/updates?id=${u.id}`}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10 px-3 text-xs font-semibold text-[rgb(200,170,130)] sm:flex-none"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Düzenle
              </Link>
              <div className="flex-1 sm:flex-none [&_button]:w-full sm:[&_button]:w-auto">
                <AdminConfirmDeleteButton
                  confirmText={`“${u.title}” güncellemesi silinsin mi? Medya kayıtları da silinir.`}
                  successTitle="Güncelleme silindi"
                  onDelete={async () => {
                    const r = await deleteClientProjectUpdate({ id: u.id });
                    return r.ok ? { ok: true } : { ok: false, error: r.error };
                  }}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
