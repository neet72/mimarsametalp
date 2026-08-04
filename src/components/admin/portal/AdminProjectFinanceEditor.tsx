"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ClientTransactionType } from "@prisma/client";
import {
  createClientProjectTransaction,
  deleteClientProjectTransaction,
} from "@/actions/admin/client-transactions";
import { useAdminToast } from "@/components/admin/ui/toast";
import { formatTry, transactionTypeTr } from "@/lib/portal/finance";
import { computeProjectBalance } from "@/lib/portal/finance";

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

  const balance = computeProjectBalance(
    items.map((i) => ({ type: i.type, amount: i.amount })),
  );

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
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-100">Cari hesap / ekstre</h2>
          <p className="text-sm text-zinc-500">
            Müşteri panelinde salt okunur. Bakiye = ödemeler − (proje bedeli + diğer).
          </p>
        </div>
        <p
          className={
            balance < 0
              ? "font-display text-xl font-semibold text-red-300"
              : balance > 0
                ? "font-display text-xl font-semibold text-emerald-300"
                : "font-display text-xl font-semibold text-zinc-200"
          }
        >
          {formatTry(balance)}
        </p>
      </div>

      <form onSubmit={onAdd} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-500">Tip</span>
          <select name="type" required className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3">
            {TYPE_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-500">Tutar (₺)</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="100000"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-500">İşlem tarihi</span>
          <input
            name="eventDate"
            type="date"
            required
            defaultValue={today}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          />
        </label>
        <label className="text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-zinc-500">Açıklama</span>
          <input
            name="description"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
            placeholder="Opsiyonel"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="h-10 w-full rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Henüz hareket yok.</p>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-lg border border-zinc-800">
          {items
            .slice()
            .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
            .map((row) => {
              const amount = Number(row.amount);
              const isPayment = row.type === "PAYMENT";
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-zinc-200">
                      {transactionTypeTr(row.type)}
                      {row.description ? (
                        <span className="text-zinc-500"> · {row.description}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-zinc-500">{toDateInput(row.eventDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={isPayment ? "font-medium text-emerald-300" : "font-medium text-red-300"}>
                      {isPayment ? "+" : "−"}
                      {formatTry(amount)}
                    </span>
                    <button
                      type="button"
                      disabled={pending}
                      className="text-red-400 hover:underline disabled:opacity-50"
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
                      Sil
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </section>
  );
}
