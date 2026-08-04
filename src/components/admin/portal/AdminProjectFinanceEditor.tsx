"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ClientTransactionType } from "@prisma/client";
import {
  createClientProjectTransaction,
  deleteClientProjectTransaction,
} from "@/actions/admin/client-transactions";
import { useAdminToast } from "@/components/admin/ui/toast";
import {
  AdminSectionCard,
  AdminStatusPill,
  adminBtnAccentClass,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/ui/AdminPageChrome";
import { computeProjectBalance, formatTry, transactionTypeTr } from "@/lib/portal/finance";
import { cn } from "@/lib/cn";
import { Plus, Trash2, Wallet } from "lucide-react";

const TYPE_OPTS: { value: ClientTransactionType; label: string }[] = [
  { value: "PROJECT_FEE", label: "Proje bedeli" },
  { value: "PAYMENT", label: "Ödeme" },
  { value: "OTHER", label: "Diğer" },
];

type TxRow = {
  id: string;
  type: ClientTransactionType;
  amount: string;
  eventDate: string;
  description: string;
};

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function AdminProjectFinanceEditor({
  projectId,
  items,
}: {
  projectId: string;
  items: TxRow[];
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const balance = computeProjectBalance(items.map((i) => ({ type: i.type, amount: i.amount })));

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await createClientProjectTransaction({
        projectId,
        type: String(fd.get("type") ?? "PAYMENT") as ClientTransactionType,
        amount: Number(fd.get("amount")),
        eventDate: String(fd.get("eventDate") ?? ""),
        description: String(fd.get("description") ?? ""),
      });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Hareket eklendi." });
      form.reset();
      router.refresh();
    });
  }

  return (
    <AdminSectionCard
      id="bolum-cari"
      eyebrow="Finans"
      title="Cari hesap / ekstre"
      description="Müşteri panelinde salt okunur. Bakiye = ödemeler − (proje bedeli + diğer)."
      actions={
        <div
          className={cn(
            "rounded-xl border px-3.5 py-2 text-right",
            balance < 0
              ? "border-red-500/25 bg-red-500/10"
              : balance > 0
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-zinc-700 bg-zinc-900/60",
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Bakiye</p>
          <p
            className={cn(
              "font-display text-lg font-semibold tabular-nums sm:text-xl",
              balance < 0 ? "text-red-300" : balance > 0 ? "text-emerald-300" : "text-zinc-100",
            )}
          >
            {formatTry(balance)}
          </p>
        </div>
      }
    >
      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-12"
      >
        <label className="sm:col-span-1 lg:col-span-2">
          <span className={adminLabelClass}>Tip</span>
          <select name="type" required className={adminFieldClass}>
            {TYPE_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-1 lg:col-span-2">
          <span className={adminLabelClass}>Tutar (₺)</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            inputMode="decimal"
            placeholder="100000"
            className={adminFieldClass}
          />
        </label>
        <label className="sm:col-span-1 lg:col-span-2">
          <span className={adminLabelClass}>İşlem tarihi</span>
          <input name="eventDate" type="date" required defaultValue={today} className={adminFieldClass} />
        </label>
        <label className="sm:col-span-1 lg:col-span-4">
          <span className={adminLabelClass}>Açıklama</span>
          <input name="description" className={adminFieldClass} placeholder="Opsiyonel" />
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-2">
          <button type="submit" disabled={pending} className={cn(adminBtnAccentClass, "w-full")}>
            <Plus className="h-4 w-4" aria-hidden />
            Ekle
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 px-4 py-10 text-center">
          <Wallet className="h-8 w-8 text-zinc-600" aria-hidden />
          <p className="text-sm text-zinc-500">Henüz hareket yok.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800">
          {items
            .slice()
            .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
            .map((row) => {
              const amount = Number(row.amount);
              const isPayment = row.type === "PAYMENT";
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusPill tone={isPayment ? "ok" : "danger"}>
                        {transactionTypeTr(row.type)}
                      </AdminStatusPill>
                      <time className="text-xs text-zinc-500" dateTime={toDateInput(row.eventDate)}>
                        {new Date(row.eventDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="truncate text-sm text-zinc-300">
                      {row.description.trim() || "Açıklama yok"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={cn(
                        "font-display text-base font-semibold tabular-nums",
                        isPayment ? "text-emerald-300" : "text-red-300",
                      )}
                    >
                      {isPayment ? "+" : "−"}
                      {formatTry(amount)}
                    </span>
                    <button
                      type="button"
                      disabled={pending}
                      aria-label="Hareketi sil"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-900/40 text-red-300 transition-colors hover:bg-red-950/40 disabled:opacity-50"
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteClientProjectTransaction({ id: row.id });
                          if (!res.ok) toast.error({ title: res.error });
                          else {
                            toast.success({ title: "Silindi." });
                            router.refresh();
                          }
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </AdminSectionCard>
  );
}
