"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createClientProject,
  deleteClientProjectStage,
  updateClientProject,
  upsertClientProjectStage,
} from "@/actions/admin/client-projects";
import { uploadAdminMedia } from "@/actions/admin/upload";
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

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

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
  const [coverUrl, setCoverUrl] = useState(initial?.coverImageUrl ?? "");
  const [uploading, setUploading] = useState(false);

  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadAdminMedia(fd);
      if (!res.ok || !res.data?.url) {
        toast.error({ title: res.ok === false ? res.error : "Kapak yüklenemedi." });
        return;
      }
      setCoverUrl(res.data.url);
      toast.success({ title: "Kapak görseli yüklendi." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (mode === "create") {
        const res = await createClientProject({
          title: String(fd.get("title") ?? ""),
          address: String(fd.get("address") ?? ""),
          status: String(fd.get("status") ?? "PLANNING") as ClientProjectStatus,
          coverImageUrl: coverUrl,
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
        coverImageUrl: coverUrl,
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
        targetDate: String(fd.get("targetDate") || "") || null,
        completedDate: String(fd.get("completedDate") || "") || null,
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Proje bilgileri</p>
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
          <span className="mb-1 block text-zinc-500">Adres / konum</span>
          <input
            name="address"
            defaultValue={initial?.address ?? ""}
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

        <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
          <p className="text-sm text-zinc-500">Kapak görseli</p>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-36 w-full rounded-lg object-cover" />
          ) : (
            <p className="text-xs text-zinc-600">Henüz kapak yok.</p>
          )}
          <input type="hidden" name="coverImageUrl" value={coverUrl} />
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[rgb(200,170,130)]">
            <span className="rounded-lg border border-zinc-700 px-3 py-1.5">
              {uploading ? "Yükleniyor…" : "Görsel yükle"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading || pending}
              onChange={onCoverFile}
            />
          </label>
          {coverUrl ? (
            <button
              type="button"
              className="ml-2 text-xs text-red-400 hover:underline"
              onClick={() => setCoverUrl("")}
            >
              Kapağı kaldır
            </button>
          ) : null}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm text-zinc-500">Atanan müşteriler</legend>
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
            {clients.length === 0 ? (
              <p className="text-sm text-zinc-600">Aktif müşteri yok — önce müşteri oluşturun.</p>
            ) : null}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50"
        >
          {mode === "create" ? "Oluştur" : "Kaydet"}
        </button>
      </form>

      {mode === "edit" && initial ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-zinc-100">Aşamalar</h2>
              <p className="text-sm text-zinc-500">
                Müşteri panelindeki ilerleme takipçisi buradan beslenir.
              </p>
            </div>
            <a
              href={`/admin/client-projects/${initial.id}/updates`}
              className="text-sm font-semibold text-[rgb(200,170,130)] hover:underline"
            >
              Rapor / güncelleme yaz →
            </a>
          </div>
          <ul className="space-y-2">
            {stages
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-zinc-100">
                      {s.orderIndex}. {s.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {s.status}
                      {s.targetDate ? ` · hedef ${toDateInput(s.targetDate)}` : ""}
                      {s.completedDate ? ` · bitti ${toDateInput(s.completedDate)}` : ""}
                    </p>
                  </div>
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
            {stages.length === 0 ? (
              <p className="text-sm text-zinc-600">Henüz aşama yok.</p>
            ) : null}
          </ul>
          <form
            onSubmit={onAddStage}
            className="grid gap-3 rounded-xl border border-zinc-800 p-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="text-sm sm:col-span-2 lg:col-span-1">
              <span className="mb-1 block text-zinc-500">Aşama adı</span>
              <input name="name" required className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-500">Sıra</span>
              <input
                name="orderIndex"
                type="number"
                defaultValue={stages.length}
                className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-500">Durum</span>
              <select name="status" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3">
                {STAGE_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-500">Hedef tarih</span>
              <input name="targetDate" type="date" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-500">Tamamlanma</span>
              <input
                name="completedDate"
                type="date"
                className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={pending}
                className="h-10 w-full rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950"
              >
                Aşama ekle
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
