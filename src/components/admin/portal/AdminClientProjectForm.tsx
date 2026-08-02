"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createClientProject,
  deleteClientProjectStage,
  updateClientProject,
  upsertClientProjectStage,
} from "@/actions/admin/client-projects";
import { useAdminToast } from "@/components/admin/ui/toast";
import type { ClientProjectStatus, ClientStageStatus } from "@prisma/client";

const STATUS_OPTS: { value: ClientProjectStatus; label: string }[] = [
  { value: "PLANNING", label: "Planlama" },
  { value: "PERMITTING", label: "Ruhsat" },
  { value: "CONSTRUCTION", label: "İnşaat" },
  { value: "INTERIOR", label: "İç mimari" },
  { value: "COMPLETED", label: "Tamamlandı" },
];

const STAGE_OPTS: { value: ClientStageStatus; label: string }[] = [
  { value: "PENDING", label: "Bekliyor" },
  { value: "IN_PROGRESS", label: "Devam" },
  { value: "DONE", label: "Bitti" },
];

type ClientOption = { id: string; fullName: string; username: string };
type StageRow = {
  id: string;
  name: string;
  orderIndex: number;
  status: ClientStageStatus;
  targetDate: string | null;
  completedDate: string | null;
};

export function AdminClientProjectForm({
  mode,
  initial,
  clients,
  stages = [],
}: {
  mode: "create" | "edit";
  initial?: {
    id: string;
    title: string;
    address: string | null;
    status: ClientProjectStatus;
    coverImageUrl: string | null;
    clientIds: string[];
  };
  clients: ClientOption[];
  stages?: StageRow[];
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(initial?.clientIds ?? []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (mode === "create") {
        const res = await createClientProject({
          title: String(fd.get("title") ?? ""),
          address: String(fd.get("address") ?? ""),
          status: String(fd.get("status") ?? "PLANNING") as ClientProjectStatus,
          coverImageUrl: String(fd.get("coverImageUrl") ?? ""),
          clientIds: selected,
        });
        if (!res.ok) {
          toast.error({ title: res.error });
          return;
        }
        toast.success({ title: "Proje oluşturuldu." });
        router.push(`/admin/client-projects/${res.data?.id}`);
        router.refresh();
        return;
      }
      if (!initial) return;
      const res = await updateClientProject({
        id: initial.id,
        title: String(fd.get("title") ?? ""),
        address: String(fd.get("address") ?? ""),
        status: String(fd.get("status") ?? "PLANNING") as ClientProjectStatus,
        coverImageUrl: String(fd.get("coverImageUrl") ?? ""),
        clientIds: selected,
      });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Kaydedildi." });
      router.refresh();
    });
  }

  function onAddStage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!initial) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await upsertClientProjectStage({
        projectId: initial.id,
        name: String(fd.get("name") ?? ""),
        orderIndex: Number(fd.get("orderIndex") ?? stages.length),
        status: String(fd.get("status") ?? "PENDING") as ClientStageStatus,
        targetDate: null,
        completedDate: null,
      });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Aşama eklendi." });
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Başlık</span>
          <input
            name="title"
            required
            defaultValue={initial?.title}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Adres</span>
          <input
            name="address"
            defaultValue={initial?.address ?? ""}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Kapak görseli URL</span>
          <input
            name="coverImageUrl"
            defaultValue={initial?.coverImageUrl ?? ""}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Durum</span>
          <select
            name="status"
            defaultValue={initial?.status ?? "PLANNING"}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="mb-2 text-sm text-zinc-500">Müşteriler</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {clients.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() =>
                    setSelected((prev) =>
                      prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                    )
                  }
                />
                {c.fullName} ({c.username})
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50"
        >
          {mode === "create" ? "Oluştur" : "Kaydet"}
        </button>
      </form>

      {mode === "edit" && initial ? (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-zinc-100">Aşamalar</h2>
          <ul className="space-y-2">
            {stages
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm"
                >
                  <span>
                    {s.orderIndex}. {s.name} — {s.status}
                  </span>
                  <button
                    type="button"
                    className="text-red-400 hover:underline"
                    onClick={() =>
                      startTransition(async () => {
                        const res = await deleteClientProjectStage({ id: s.id });
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
                </li>
              ))}
          </ul>
          <form onSubmit={onAddStage} className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 p-4">
            <label className="text-sm">
              <span className="mb-1 block text-zinc-500">Ad</span>
              <input name="name" required className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-500">Sıra</span>
              <input
                name="orderIndex"
                type="number"
                defaultValue={stages.length}
                className="h-10 w-20 rounded-lg border border-zinc-800 bg-zinc-950 px-3"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-500">Durum</span>
              <select name="status" className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3">
                {STAGE_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={pending}
              className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950"
            >
              Aşama ekle
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
