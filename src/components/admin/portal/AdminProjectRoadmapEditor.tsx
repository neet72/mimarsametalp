"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClientProjectCategory } from "@prisma/client";
import {
  deleteClientProjectRoadmapItem,
  reorderClientProjectRoadmapItems,
  upsertClientProjectRoadmapItem,
} from "@/actions/admin/client-projects";
import { useAdminToast } from "@/components/admin/ui/toast";
import {
  AdminSectionCard,
  AdminStatusPill,
  adminBtnAccentClass,
  adminBtnSecondaryClass,
  adminFieldClass,
  adminIconBtnClass,
  adminLabelClass,
  adminTextareaClass,
} from "@/components/admin/ui/AdminPageChrome";
import {
  CLIENT_PROJECT_CATEGORY_OPTS,
  formatWeeksTr,
  projectCategoryTr,
  summarizeRoadmapByCategory,
} from "@/lib/portal/labels";
import { cn } from "@/lib/cn";
import { ArrowDown, ArrowUp, Map, Pencil, Plus, Trash2, X } from "lucide-react";

export type RoadmapRow = {
  id: string;
  title: string;
  note: string;
  category: ClientProjectCategory;
  startDate: string;
  endDate: string | null;
  orderIndex: number;
  visible: boolean;
};

function toDateInput(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formatRangeLabel(startIso: string, endIso: string | null) {
  const start = new Date(startIso);
  const fmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  if (!endIso) return fmt(start);
  return `${fmt(start)} – ${fmt(new Date(endIso))}`;
}

type Draft = {
  id?: string;
  title: string;
  note: string;
  category: ClientProjectCategory;
  startDate: string;
  endDate: string;
  visible: boolean;
};

const emptyDraft = (): Draft => ({
  title: "",
  note: "",
  category: "DIGER",
  startDate: "",
  endDate: "",
  visible: true,
});

export function AdminProjectRoadmapEditor({
  projectId,
  items,
}: {
  projectId: string;
  items: RoadmapRow[];
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title, "tr")),
    [items],
  );

  const categorySummary = useMemo(
    () =>
      summarizeRoadmapByCategory(
        sorted
          .filter((r) => r.visible)
          .map((r) => ({
            category: r.category,
            startDate: r.startDate,
            endDate: r.endDate,
          })),
      ),
    [sorted],
  );

  function openCreate() {
    setDraft(emptyDraft());
  }

  function openEdit(row: RoadmapRow) {
    setDraft({
      id: row.id,
      title: row.title,
      note: row.note,
      category: row.category,
      startDate: toDateInput(row.startDate),
      endDate: toDateInput(row.endDate),
      visible: row.visible,
    });
  }

  function saveDraft() {
    if (!draft) return;
    startTransition(async () => {
      const res = await upsertClientProjectRoadmapItem({
        id: draft.id,
        projectId,
        title: draft.title,
        note: draft.note,
        category: draft.category,
        startDate: draft.startDate,
        endDate: draft.endDate || "",
        visible: draft.visible,
      });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: draft.id ? "Madde güncellendi." : "Madde eklendi." });
      setDraft(null);
      router.refresh();
    });
  }

  function remove(id: string, title: string) {
    if (!confirm(`“${title}” yol haritası maddesi silinsin mi?`)) return;
    startTransition(async () => {
      const res = await deleteClientProjectRoadmapItem({ id });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Madde silindi." });
      if (draft?.id === id) setDraft(null);
      router.refresh();
    });
  }

  function move(id: string, dir: -1 | 1) {
    const ids = sorted.map((x) => x.id);
    const idx = ids.indexOf(id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ids.length) return;
    const next = [...ids];
    const tmp = next[idx]!;
    next[idx] = next[swap]!;
    next[swap] = tmp;
    startTransition(async () => {
      const res = await reorderClientProjectRoadmapItems({ projectId, orderedIds: next });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminSectionCard
      id="bolum-yol-haritasi"
      eyebrow="Süreç"
      title="Yol haritası"
      description="Her maddeye kategori verin; müşteri panelinde kategori süre özeti (hafta) görünür."
      actions={
        <button
          type="button"
          disabled={pending || draft !== null}
          onClick={openCreate}
          className={cn(adminBtnAccentClass, "w-full sm:w-auto")}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Madde ekle
        </button>
      }
    >
      {categorySummary.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {categorySummary.map((row) => (
            <li
              key={row.category}
              className="rounded-full border border-zinc-700/80 bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300"
            >
              <span className="font-semibold text-[rgb(200,170,130)]">{row.label}</span>
              <span className="text-zinc-600"> · </span>
              {formatWeeksTr(row.weeks)}
              <span className="hidden text-zinc-600 sm:inline"> ({row.days} gün)</span>
            </li>
          ))}
        </ul>
      ) : null}

      {sorted.length === 0 && !draft ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 px-4 py-10 text-center">
          <Map className="h-8 w-8 text-zinc-600" aria-hidden />
          <p className="text-sm text-zinc-500">Henüz yol haritası maddesi yok.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((row, i) => (
            <li
              key={row.id}
              className="rounded-xl border border-zinc-800/90 bg-zinc-950/40 p-3 sm:p-3.5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-zinc-100">{row.title}</p>
                    <AdminStatusPill tone="accent">{projectCategoryTr(row.category)}</AdminStatusPill>
                    {!row.visible ? <AdminStatusPill tone="neutral">Gizli</AdminStatusPill> : null}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {formatRangeLabel(row.startDate, row.endDate)}
                    {row.note.trim() ? " · not var" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap">
                  <button
                    type="button"
                    disabled={pending || i === 0}
                    onClick={() => move(row.id, -1)}
                    className={adminIconBtnClass}
                    aria-label="Yukarı"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={pending || i === sorted.length - 1}
                    onClick={() => move(row.id, 1)}
                    className={adminIconBtnClass}
                    aria-label="Aşağı"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => openEdit(row)}
                    className={cn(adminIconBtnClass, "text-[rgb(200,170,130)]")}
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(row.id, row.title)}
                    className={cn(adminIconBtnClass, "border-red-900/40 text-red-300 hover:bg-red-950/40")}
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft ? (
        <div className="space-y-3 rounded-xl border border-[rgb(166,124,82)]/25 bg-zinc-950 p-4 ring-1 ring-[rgb(166,124,82)]/10">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-200">
              {draft.id ? "Maddeyi düzenle" : "Yeni madde"}
            </p>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className={adminIconBtnClass}
              aria-label="Kapat"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <label className="block">
            <span className={adminLabelClass}>Başlık</span>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Örn. Ruhsat başvurusu"
              className={adminFieldClass}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Kategori</span>
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as ClientProjectCategory })
              }
              className={adminFieldClass}
            >
              {CLIENT_PROJECT_CATEGORY_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabelClass}>Başlangıç</span>
              <input
                type="date"
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                className={adminFieldClass}
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Bitiş (opsiyonel)</span>
              <input
                type="date"
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                className={adminFieldClass}
              />
            </label>
          </div>
          <label className="block">
            <span className={adminLabelClass}>Not</span>
            <textarea
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              rows={4}
              placeholder="Müşterinin göreceği açıklama…"
              className={adminTextareaClass}
            />
          </label>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={draft.visible}
              onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-700"
            />
            Müşteri panelinde görünür
          </label>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button
              type="button"
              disabled={pending || !draft.title.trim() || !draft.startDate}
              onClick={saveDraft}
              className={cn(adminBtnAccentClass, "w-full sm:w-auto")}
            >
              {pending ? "Kaydediliyor…" : draft.id ? "Güncelle" : "Kaydet"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setDraft(null)}
              className={cn(adminBtnSecondaryClass, "w-full sm:w-auto")}
            >
              İptal
            </button>
          </div>
        </div>
      ) : null}
    </AdminSectionCard>
  );
}
