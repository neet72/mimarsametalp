"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProject } from "@/actions/admin/projects";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`“${title}” silinsin mi?`)) return;
          setErr(null);
          startTransition(async () => {
            const r = await deleteProject(id);
            if (!r.ok) setErr(r.error ?? "Silinemedi");
            else router.refresh();
          });
        }}
        className="rounded-md border border-red-900/50 bg-red-950/30 px-2 py-1 text-xs text-red-300 hover:bg-red-950/50 disabled:opacity-50"
      >
        {pending ? "…" : "Sil"}
      </button>
      {err ? <span className="text-[10px] text-red-400">{err}</span> : null}
    </div>
  );
}
