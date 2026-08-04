"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useAdminToast } from "@/components/admin/ui/toast";

type DeleteResult = { ok: true } | { ok: false; error: string };

export function AdminConfirmDeleteButton({
  label = "Sil",
  confirmText,
  successTitle,
  onDelete,
  redirectTo,
  className,
}: {
  label?: string;
  confirmText: string;
  successTitle: string;
  onDelete: () => Promise<DeleteResult>;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(confirmText)) return;
          setErr(null);
          startTransition(async () => {
            const r = await onDelete();
            if (!r.ok) {
              const msg = r.error || "Silinemedi";
              setErr(msg);
              toast.error({ title: "Silme başarısız", description: msg });
              return;
            }
            toast.success({ title: successTitle });
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          });
        }}
        className={
          className ??
          "inline-flex min-h-11 items-center justify-center rounded-lg border border-red-900/50 bg-red-950/30 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-950/50 disabled:opacity-50"
        }
      >
        {pending ? "…" : label}
      </button>
      {err ? <span className="text-[10px] text-red-400">{err}</span> : null}
    </div>
  );
}
