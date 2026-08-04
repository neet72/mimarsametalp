"use client";

import Link from "next/link";
import { deleteClientProject } from "@/actions/admin/client-projects";
import { AdminConfirmDeleteButton } from "@/components/admin/portal/AdminConfirmDeleteButton";
import { AdminStatusPill } from "@/components/admin/ui/AdminPageChrome";
import { projectCategoryTr, projectStatusTr } from "@/lib/portal/labels";
import { FilePenLine, Pencil } from "lucide-react";

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
    <ul className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-zinc-800 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-zinc-800 sm:bg-zinc-950/40">
      {projects.map((p) => (
        <li
          key={p.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 transition-colors hover:border-zinc-700 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-4 sm:py-4 sm:hover:bg-zinc-900/40"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium text-zinc-100">{p.title}</p>
                <AdminStatusPill tone="accent">{projectCategoryTr(p.category)}</AdminStatusPill>
                <AdminStatusPill tone="neutral">{projectStatusTr(p.status)}</AdminStatusPill>
              </div>
              <p className="text-xs text-zinc-500 sm:text-sm">
                {p.memberCount} üye · {p.stageCount} aşama · {p.updateCount} güncelleme
                {p.address ? ` · ${p.address}` : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <Link
                href={`/admin/client-projects/${p.id}`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 px-3 text-xs font-semibold text-zinc-300 hover:border-zinc-600"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Düzenle
              </Link>
              <Link
                href={`/admin/client-projects/${p.id}/updates`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10 px-3 text-xs font-semibold text-[rgb(200,170,130)]"
              >
                <FilePenLine className="h-3.5 w-3.5" aria-hidden />
                Güncellemeler
              </Link>
              <div className="col-span-2 sm:col-span-1 [&_button]:w-full sm:[&_button]:w-auto">
                <AdminConfirmDeleteButton
                  confirmText={`“${p.title}” portal projesi silinsin mi? Aşamalar ve güncellemeler de silinir.`}
                  successTitle="Proje silindi"
                  onDelete={async () => {
                    const r = await deleteClientProject({ id: p.id });
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
