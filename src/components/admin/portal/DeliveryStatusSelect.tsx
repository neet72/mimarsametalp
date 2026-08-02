"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateDeliveryRequestStatus } from "@/actions/admin/delivery-requests";
import { useAdminToast } from "@/components/admin/ui/toast";

const STATUSES = [
  { value: "new", label: "Yeni" },
  { value: "in_progress", label: "İşleniyor" },
  { value: "done", label: "Tamam" },
  { value: "cancelled", label: "İptal" },
] as const;

export function DeliveryStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();

  return (
    <select
      disabled={pending}
      value={status}
      className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-sm"
      onChange={(e) => {
        const next = e.target.value as (typeof STATUSES)[number]["value"];
        startTransition(async () => {
          const res = await updateDeliveryRequestStatus({ id, status: next });
          if (!res.ok) toast.error({ title: res.error });
          else {
            toast.success({ title: "Durum güncellendi." });
            router.refresh();
          }
        });
      }}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
