"use client";

import Link from "next/link";
import { deleteClientProjectUpdate } from "@/actions/admin/client-updates";
import { AdminConfirmDeleteButton } from "@/components/admin/portal/AdminConfirmDeleteButton";

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
    return <p className="text-sm text-zinc-500">Henüz kayıt yok.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      {updates.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          <div>
            <p className="text-zinc-100">{u.title}</p>
            <p className="text-zinc-500">
              {u.isPublished ? "Yayında" : "Taslak"}
              {u.eventDate
                ? ` · ${new Date(u.eventDate).toLocaleDateString("tr-TR")}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/client-projects/${projectId}/updates?id=${u.id}`}
              className="text-[rgb(166,124,82)] hover:underline"
            >
              Düzenle
            </Link>
            <AdminConfirmDeleteButton
              confirmText={`“${u.title}” güncellemesi silinsin mi? Medya kayıtları da silinir.`}
              successTitle="Güncelleme silindi"
              onDelete={async () => {
                const r = await deleteClientProjectUpdate({ id: u.id });
                return r.ok ? { ok: true } : { ok: false, error: r.error };
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
