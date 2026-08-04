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
import {
  AdminSectionCard,
  AdminStatusPill,
  adminBtnAccentClass,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/ui/AdminPageChrome";
import type { ClientProjectCategory, ClientProjectStatus, ClientStageStatus } from "@prisma/client";
import { CLIENT_PROJECT_CATEGORY_OPTS } from "@/lib/portal/labels";
import { cn } from "@/lib/cn";
import { ImagePlus, Pencil, Trash2, X } from "lucide-react";

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

type StageDraft = {
  id?: string;
  name: string;
  orderIndex: number;
  status: ClientStageStatus;
  targetDate: string;
  completedDate: string;
};

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function emptyStageDraft(orderIndex: number): StageDraft {
  return {
    name: "",
    orderIndex,
    status: "PENDING",
    targetDate: "",
    completedDate: "",
  };
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
    category: ClientProjectCategory;
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
  const [stageDraft, setStageDraft] = useState<StageDraft | null>(null);

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
          category: String(fd.get("category") ?? "DIGER") as ClientProjectCategory,
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
        category: String(fd.get("category") ?? "DIGER") as ClientProjectCategory,
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
        id: stageDraft?.id,
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
      toast.success({ title: stageDraft?.id ? "Aşama güncellendi." : "Aşama eklendi." });
      setStageDraft(null);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  function openEditStage(s: StageRow) {
    setStageDraft({
      id: s.id,
      name: s.name,
      orderIndex: s.orderIndex,
      status: s.status,
      targetDate: toDateInput(s.targetDate),
      completedDate: toDateInput(s.completedDate),
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <AdminSectionCard
        eyebrow="Proje"
        title="Proje bilgileri"
        description="Başlık, kategori, kapak ve atanan müşteriler."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className={adminLabelClass}>Başlık</span>
            <input
              name="title"
              required
              defaultValue={initial?.title}
              className={adminFieldClass}
            />
          </label>

          <label className="block">
            <span className={adminLabelClass}>Adres / konum</span>
            <input
              name="address"
              defaultValue={initial?.address ?? ""}
              className={adminFieldClass}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabelClass}>Durum</span>
              <select
                name="status"
                defaultValue={initial?.status ?? "PLANNING"}
                className={adminFieldClass}
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={adminLabelClass}>Kategori</span>
              <select
                name="category"
                defaultValue={initial?.category ?? "DIGER"}
                className={adminFieldClass}
              >
                {CLIENT_PROJECT_CATEGORY_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 sm:p-4">
            <p className="text-xs font-medium text-zinc-500">Kapak görseli</p>
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt=""
                className="aspect-[21/9] w-full rounded-lg object-cover sm:aspect-[2.4/1]"
              />
            ) : (
              <div className="flex aspect-[21/9] items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 sm:aspect-[2.4/1]">
                <p className="text-xs text-zinc-600">Henüz kapak yok</p>
              </div>
            )}
            <input type="hidden" name="coverImageUrl" value={coverUrl} />
            <div className="flex flex-wrap gap-2">
              <label
                className={cn(
                  adminBtnAccentClass,
                  "cursor-pointer",
                  (uploading || pending) && "pointer-events-none opacity-50",
                )}
              >
                <ImagePlus className="h-4 w-4" aria-hidden />
                {uploading ? "Yükleniyor…" : "Görsel yükle"}
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
                  className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-red-300 hover:bg-red-950/30"
                  onClick={() => setCoverUrl("")}
                >
                  Kapağı kaldır
                </button>
              ) : null}
            </div>
          </div>

          <fieldset>
            <legend className={cn(adminLabelClass, "mb-2")}>Atanan müşteriler</legend>
            <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-zinc-800 p-2 sm:grid-cols-2 sm:max-h-none sm:overflow-visible sm:p-3">
              {clients.map((c) => (
                <label
                  key={c.id}
                  className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm text-zinc-300 hover:bg-zinc-900/60"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                      )
                    }
                    className="h-4 w-4 rounded border-zinc-700"
                  />
                  <span className="min-w-0 truncate">
                    {c.fullName}{" "}
                    <span className="text-zinc-600">({c.username})</span>
                  </span>
                </label>
              ))}
              {clients.length === 0 ? (
                <p className="col-span-full px-2 py-3 text-sm text-zinc-600">
                  Aktif müşteri yok — önce müşteri oluşturun.
                </p>
              ) : null}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={pending || uploading}
            className={cn(adminBtnAccentClass, "w-full sm:w-auto")}
          >
            {mode === "create" ? "Oluştur" : "Kaydet"}
          </button>
        </form>
      </AdminSectionCard>

      {mode === "edit" && initial ? (
        <AdminSectionCard
          eyebrow="İlerleme"
          title="Aşamalar"
          description="Müşteri panelindeki ilerleme takipçisi buradan beslenir."
          actions={
            <a
              href={`/admin/client-projects/${initial.id}/updates`}
              className="text-sm font-semibold text-[rgb(200,170,130)] underline-offset-2 hover:underline"
            >
              Rapor yaz →
            </a>
          }
        >
          <ul className="space-y-2">
            {stages
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-800/90 bg-zinc-950/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100">
                      {s.orderIndex}. {s.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <AdminStatusPill tone="neutral">
                        {STAGE_OPTS.find((o) => o.value === s.status)?.label ?? s.status}
                      </AdminStatusPill>
                      {s.targetDate ? (
                        <span className="text-xs text-zinc-500">
                          hedef {toDateInput(s.targetDate)}
                        </span>
                      ) : null}
                      {s.completedDate ? (
                        <span className="text-xs text-zinc-500">
                          bitti {toDateInput(s.completedDate)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      aria-label="Aşamayı düzenle"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 text-[rgb(200,170,130)] hover:bg-zinc-900"
                      onClick={() => openEditStage(s)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Aşamayı sil"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-900/40 text-red-300 hover:bg-red-950/40"
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteClientProjectStage({ id: s.id });
                          if (!res.ok) toast.error({ title: res.error });
                          else {
                            toast.success({ title: "Silindi." });
                            if (stageDraft?.id === s.id) setStageDraft(null);
                            router.refresh();
                          }
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            {stages.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-600">
                Henüz aşama yok.
              </p>
            ) : null}
          </ul>

          {stageDraft ? (
            <form
              key={stageDraft.id ?? "new-stage"}
              onSubmit={onAddStage}
              className="grid gap-3 rounded-xl border border-[rgb(166,124,82)]/25 bg-zinc-950 p-3 ring-1 ring-[rgb(166,124,82)]/10 sm:grid-cols-2 sm:p-4 lg:grid-cols-3"
            >
              <div className="flex items-center justify-between gap-2 sm:col-span-2 lg:col-span-3">
                <p className="text-sm font-medium text-zinc-200">
                  {stageDraft.id ? "Aşamayı düzenle" : "Yeni aşama"}
                </p>
                <button
                  type="button"
                  aria-label="Kapat"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-900"
                  onClick={() => setStageDraft(null)}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <label className="sm:col-span-2 lg:col-span-1">
                <span className={adminLabelClass}>Aşama adı</span>
                <input
                  name="name"
                  required
                  defaultValue={stageDraft.name}
                  className={adminFieldClass}
                />
              </label>
              <label>
                <span className={adminLabelClass}>Sıra</span>
                <input
                  name="orderIndex"
                  type="number"
                  defaultValue={stageDraft.orderIndex}
                  className={adminFieldClass}
                />
              </label>
              <label>
                <span className={adminLabelClass}>Durum</span>
                <select name="status" defaultValue={stageDraft.status} className={adminFieldClass}>
                  {STAGE_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={adminLabelClass}>Hedef tarih</span>
                <input
                  name="targetDate"
                  type="date"
                  defaultValue={stageDraft.targetDate}
                  className={adminFieldClass}
                />
              </label>
              <label>
                <span className={adminLabelClass}>Tamamlanma</span>
                <input
                  name="completedDate"
                  type="date"
                  defaultValue={stageDraft.completedDate}
                  className={adminFieldClass}
                />
              </label>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                <button type="submit" disabled={pending} className={cn(adminBtnAccentClass, "w-full")}>
                  {stageDraft.id ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setStageDraft(emptyStageDraft(stages.length))}
              className={cn(adminBtnAccentClass, "w-full sm:w-auto")}
            >
              Aşama ekle
            </button>
          )}
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
