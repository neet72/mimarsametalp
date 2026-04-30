"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Save, Trash2, ChevronDown } from "lucide-react";
import { upsertService } from "@/actions/admin/services";
import { uploadAdminMedia } from "@/actions/admin/upload";
import { SERVICES_GALLERY as SERVICES_GALLERY_TR } from "@/content/services-gallery";
import { SERVICES_GALLERY as SERVICES_GALLERY_EN } from "@/content/services-gallery.en";

type Row = {
  slug: string;
  title: string;
  heroImageUrl?: string;
  shortDescription?: string;
};

export function ServicesAdminPanel() {
  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    for (const s of SERVICES_GALLERY_TR) {
      map.set(s.slug, { slug: s.slug, title: s.title, heroImageUrl: s.imageUrl });
    }
    for (const s of SERVICES_GALLERY_EN) {
      const prev = map.get(s.slug);
      if (!prev) map.set(s.slug, { slug: s.slug, title: s.title, heroImageUrl: s.imageUrl });
    }
    return Array.from(map.values()).sort((a, b) => a.slug.localeCompare(b.slug));
  }, []);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-zinc-100">
            Hizmetler Paneli (Yeni)
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Mevcut sayfa/bileşenleri kaldırmadan; hizmetler için düzenleme paneli.
          </p>
        </div>
        <div className="text-xs text-zinc-500">
          Not: DB tablosu yoksa “Kaydet” hata verebilir.
        </div>
      </div>

      <div className="grid gap-4">
        {rows.map((row) => (
          <ServiceRow key={row.slug} row={row} />
        ))}
      </div>
    </div>
  );
}

function ServiceRow({ row }: { row: Row }) {
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [heroImageUrl, setHeroImageUrl] = useState(row.heroImageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [scope, setScope] = useState<string[]>([""]);
  const [process, setProcess] = useState<Array<{ title: string; description: string }>>([
    { title: "", description: "" },
  ]);
  const [faq, setFaq] = useState<Array<{ question: string; answer: string }>>([
    { question: "", answer: "" },
  ]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      const f = Array.from(files)[0];
      if (!f) return;
      const fd = new FormData();
      fd.set("file", f);
      const json = await uploadAdminMedia(fd);
      if (!json.ok || !json.data?.url) throw new Error(json.error || "Yükleme başarısız.");
      setHeroImageUrl(json.data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4"
      action={(fd) => {
        setOk(null);
        setErr(null);
        setUploadError(null);
        startTransition(async () => {
          fd.set("heroImageUrl", heroImageUrl);
          fd.set("scopeJson", JSON.stringify(scope.filter((s) => s.trim().length > 0)));
          fd.set(
            "processJson",
            JSON.stringify(
              process
                .map((s) => ({ title: s.title.trim(), description: s.description.trim() }))
                .filter((s) => s.title.length > 0 || s.description.length > 0),
            ),
          );
          fd.set(
            "faqJson",
            JSON.stringify(
              faq
                .map((x) => ({ question: x.question.trim(), answer: x.answer.trim() }))
                .filter((x) => x.question.length > 0 || x.answer.length > 0),
            ),
          );
          const res = await upsertService(fd);
          if (res.ok) setOk("Kaydedildi.");
          else setErr(res.error ?? "Hata.");
        });
      }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Slug
            </label>
            <input
              name="slug"
              defaultValue={row.slug}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div className="space-y-1 md:col-span-1 lg:col-span-1">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Başlık
            </label>
            <input
              name="title"
              defaultValue={row.title}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div className="space-y-1 md:col-span-2 lg:col-span-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Hero Görsel URL
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  name="heroImageUrl"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://... veya /images/..."
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900">
                  {uploading ? "Yükleniyor…" : "Cihazdan Yükle"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void uploadFiles(e.currentTarget.files);
                      e.currentTarget.value = "";
                    }}
                    disabled={pending || uploading}
                  />
                </label>
              </div>
              {uploadError ? <p className="text-xs text-red-400">{uploadError}</p> : null}
            </div>
          </div>
          <div className="space-y-1 md:col-span-2 lg:col-span-4">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Kısa Açıklama
            </label>
            <input
              name="shortDescription"
              defaultValue={row.shortDescription ?? ""}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
            Detaylar
          </button>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              name="published"
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-950"
            />
            Yayınla
          </label>
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Sıra
            </label>
            <input
              name="sortOrder"
              defaultValue="0"
              inputMode="numeric"
              className="w-24 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      {detailsOpen ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-12">
          {/* Scope card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                Hizmet Kapsamı
              </h3>
              <button
                type="button"
                onClick={() => setScope((v) => [...v, ""])}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Ekle
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {scope.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={val}
                    onChange={(e) => {
                      const next = [...scope];
                      next[idx] = e.target.value;
                      setScope(next);
                    }}
                    placeholder="Madde..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => setScope((v) => v.filter((_, i) => i !== idx))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                    aria-label="Sil"
                    disabled={scope.length === 1}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Process cards */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                Hizmet Süreci (Kartlar)
              </h3>
              <button
                type="button"
                onClick={() => setProcess((v) => [...v, { title: "", description: "" }])}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Adım Ekle
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {process.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Step {String(idx + 1).padStart(2, "0")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setProcess((v) => v.filter((_, i) => i !== idx))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                      aria-label="Sil"
                      disabled={process.length === 1}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <input
                    value={step.title}
                    onChange={(e) => {
                      const next = [...process];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setProcess(next);
                    }}
                    placeholder="Başlık"
                    className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => {
                      const next = [...process];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setProcess(next);
                    }}
                    placeholder="Açıklama"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FAQ accordion-like */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-12">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                Sık Sorulan Sorular (SSS)
              </h3>
              <button
                type="button"
                onClick={() => setFaq((v) => [...v, { question: "", answer: "" }])}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Soru Ekle
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {faq.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Soru {String(idx + 1).padStart(2, "0")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFaq((v) => v.filter((_, i) => i !== idx))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                      aria-label="Sil"
                      disabled={faq.length === 1}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <input
                    value={item.question}
                    onChange={(e) => {
                      const next = [...faq];
                      next[idx] = { ...next[idx], question: e.target.value };
                      setFaq(next);
                    }}
                    placeholder="Soru"
                    className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const next = [...faq];
                      next[idx] = { ...next[idx], answer: e.target.value };
                      setFaq(next);
                    }}
                    placeholder="Cevap"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {ok ? <p className="mt-3 text-xs text-emerald-400">{ok}</p> : null}
      {err ? <p className="mt-3 text-xs text-red-400">{err}</p> : null}
    </form>
  );
}

