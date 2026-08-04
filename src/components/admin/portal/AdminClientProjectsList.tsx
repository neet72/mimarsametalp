"use client";

import Link from "next/link";
import { deleteClientProject } from "@/actions/admin/client-projects";
import { AdminConfirmDeleteButton } from "@/components/admin/portal/AdminConfirmDeleteButton";
import { AdminStatusPill } from "@/components/admin/ui/AdminPageChrome";
import { projectCategoryTr, projectStatusTr } from "@/lib/portal/labels";

type Row = {
  id: string;
  title: string;
  status: string;
  category: string;
  address: string | null;
  memberCount: number;
  stageCount: number;
  updateCount: number;
};

export function AdminClientProjectsList({ projects }: { projects: Row[] }) {
  return (
    <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
      {projects.map((p) => (
        <li
          key={p.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm transition-colors hover:bg-zinc-900/40"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium text-zinc-100">{p.title}</p>
              <AdminStatusPill tone="accent">{projectCategoryTr(p.category)}</AdminStatusPill>
              <AdminStatusPill tone="neutral">{projectStatusTr(p.status)}</AdminStatusPill>
            </div>
            <p className="mt-1 text-zinc-500">
              {p.memberCount} üye · {p.stageCount} aşama · {p.updateCount} güncelleme
              {p.address ? ` · ${p.address}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/client-projects/${p.id}`}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-600"
            >
              Düzenle
            </Link>
            <Link
              href={`/admin/client-projects/${p.id}/updates`}
              className="rounded-lg border border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10 px-3 py-1.5 text-xs font-semibold text-[rgb(200,170,130)]"
            >
              Güncellemeler
            </Link>
            <AdminConfirmDeleteButton
              confirmText={`“${p.title}” portal projesi silinsin mi? Aşamalar ve güncellemeler de silinir.`}
              successTitle="Proje silindi"
              onDelete={async () => {
                const r = await deleteClientProject({ id: p.id });
                return r.ok ? { ok: true } : { ok: false, error: r.error };
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
