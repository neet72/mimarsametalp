"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setMessageRead } from "@/actions/admin/messages";
import { useAdminToast } from "@/components/admin/ui/toast";

export function MessageReadToggle({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const toast = useAdminToast();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const r = await setMessageRead(id, !read);
          if (!r.ok) toast.error({ title: "Güncelleme başarısız", description: r.error });
          else toast.success({ title: read ? "Okunmamış" : "Okundu işaretlendi" });
          router.refresh();
        });
      }}
      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
    >
      {read ? "Okunmadı yap" : "Okundu işaretle"}
    </button>
  );
}
