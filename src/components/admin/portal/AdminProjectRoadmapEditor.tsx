"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteClientProjectRoadmapItem,
  reorderClientProjectRoadmapItems,
  upsertClientProjectRoadmapItem,
} from "@/actions/admin/client-projects";
import { useAdminToast } from "@/components/admin/ui/toast";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";

export type RoadmapRow = {
  id: string;
  title: string;
  note: string;
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
  startDate: string;
  endDate: string;
  visible: boolean;
};

const emptyDraft = (): Draft => ({
  title: "",
  note: "",
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

  function openCreate() {
    setDraft(emptyDraft());
  }

  function openEdit(row: RoadmapRow) {
    setDraft({
      id: row.id,
      title: row.title,
      note: row.note,
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
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-100">Yol haritası</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Müşteri özetinde timeline olarak görünür. Tarih veya aralık + not girin; tıklayınca not açılır.
            Aşamalardan bağımsızdır.
          </p>
        </div>
        <button
          type="button"
          disabled={pending || draft !== null}
          onClick={openCreate}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[rgb(166,124,82)]/40 bg-[rgb(166,124,82)]/10 px-3 text-xs font-semibold text-[rgb(200,170,130)] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Madde ekle
        </button>
      </div>

      {sorted.length === 0 && !draft ? (
        <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Henüz yol haritası maddesi yok.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
          {sorted.map((row, i) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-zinc-100">{row.title}</p>
                  {!row.visible ? (
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-500">
                      gizli
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {formatRangeLabel(row.startDate, row.endDate)}
                  {row.note.trim() ? " · not var" : " · not yok"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={pending || i === 0}
                  onClick={() => move(row.id, -1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 hover:bg-zinc-900 disabled:opacity-40"
                  aria-label="Yukarı"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={pending || i === sorted.length - 1}
                  onClick={() => move(row.id, 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 hover:bg-zinc-900 disabled:opacity-40"
                  aria-label="Aşağı"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => openEdit(row)}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-800 px-2 text-xs text-[rgb(200,170,130)] hover:bg-zinc-900 disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Düzenle
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(row.id, row.title)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-900/40 text-red-300 hover:bg-red-950/40 disabled:opacity-50"
                  aria-label="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft ? (
        <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-200">
              {draft.id ? "Maddeyi düzenle" : "Yeni madde"}
            </p>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-900"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">Başlık</span>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Örn. Ruhsat başvurusu"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Başlangıç (zorunlu)</span>
              <input
                type="date"
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Bitiş (opsiyonel — aralık)</span>
              <input
                type="date"
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">Not (tıklanınca açılır)</span>
            <textarea
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              rows={4}
              placeholder="Müşterinin göreceği açıklama…"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={draft.visible}
              onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
              className="rounded border-zinc-700"
            />
            Müşteri panelinde görünür
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={pending || !draft.title.trim() || !draft.startDate}
              onClick={saveDraft}
              className="inline-flex min-h-10 items-center rounded-lg bg-[rgb(166,124,82)] px-4 text-sm font-semibold text-zinc-950 disabled:opacity-50"
            >
              {pending ? "Kaydediliyor…" : draft.id ? "Güncelle" : "Kaydet"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setDraft(null)}
              className="inline-flex min-h-10 items-center rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300"
            >
              İptal
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
