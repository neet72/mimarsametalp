"use client";

import Link from "next/link";
import { deleteClientProject } from "@/actions/admin/client-projects";
import { AdminConfirmDeleteButton } from "@/components/admin/portal/AdminConfirmDeleteButton";

export function AdminClientProjectHeaderActions({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Link href={`/admin/client-projects/${projectId}/updates`} className="text-[rgb(166,124,82)]">
        Güncellemeler
      </Link>
      <Link href="/admin/client-projects" className="text-zinc-500">
        ← Liste
      </Link>
      <AdminConfirmDeleteButton
        confirmText={`“${title}” portal projesi silinsin mi? Aşamalar ve güncellemeler de silinir.`}
        successTitle="Proje silindi"
        redirectTo="/admin/client-projects"
        onDelete={async () => {
          const r = await deleteClientProject({ id: projectId });
          return r.ok ? { ok: true } : { ok: false, error: r.error };
        }}
      />
    </div>
  );
}
