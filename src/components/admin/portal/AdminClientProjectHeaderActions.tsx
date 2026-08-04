"use client";

import Link from "next/link";
import { deleteClientProject } from "@/actions/admin/client-projects";
import { AdminConfirmDeleteButton } from "@/components/admin/portal/AdminConfirmDeleteButton";
import { adminBtnAccentClass, adminBtnSecondaryClass } from "@/components/admin/ui/AdminPageChrome";
import { cn } from "@/lib/cn";
import { ArrowLeft, FilePenLine } from "lucide-react";

export function AdminClientProjectHeaderActions({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <Link
        href={`/admin/client-projects/${projectId}/updates`}
        className={cn(adminBtnAccentClass, "w-full justify-center sm:w-auto")}
      >
        <FilePenLine className="h-4 w-4" aria-hidden />
        Güncellemeler
      </Link>
      <Link
        href="/admin/client-projects"
        className={cn(adminBtnSecondaryClass, "w-full justify-center sm:w-auto")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Liste
      </Link>
      <div className="w-full sm:w-auto [&_button]:min-h-11 [&_button]:w-full sm:[&_button]:w-auto">
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
    </div>
  );
}
