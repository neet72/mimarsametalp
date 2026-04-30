"use client";

import { useMemo, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { upsertSiteContent } from "@/actions/admin/site-content";
import { uploadAdminMedia } from "@/actions/admin/upload";

type Locale = "tr" | "en";

type AboutDraft = {
  visionTitle: string;
  visionBody: string;
  architectName: string;
  architectRole: string;
  architectBio: string;
  portraitImageUrl: string;
};

const emptyDraft: AboutDraft = {
  visionTitle: "",
  visionBody: "",
  architectName: "",
  architectRole: "",
  architectBio: "",
  portraitImageUrl: "",
};

export function AboutAdminPanel({
  initialTr,
  initialEn,
}: {
  initialTr?: string | null;
  initialEn?: string | null;
}) {
  const [tab, setTab] = useState<Locale>("tr");
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const initial = useMemo(() => {
    const parse = (s?: string | null) => {
      if (!s) return emptyDraft;
      try {
        const j = JSON.parse(s) as Partial<AboutDraft>;
        return { ...emptyDraft, ...j };
      } catch {
        return emptyDraft;
      }
    };
    return { tr: parse(initialTr), en: parse(initialEn) } as const;
  }, [initialEn, initialTr]);

  const [draftTr, setDraftTr] = useState<AboutDraft>(initial.tr);
  const [draftEn, setDraftEn] = useState<AboutDraft>(initial.en);
  const draft = tab === "tr" ? draftTr : draftEn;
  const setDraft = tab === "tr" ? setDraftTr : setDraftEn;

  async function uploadSingleImage(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = Array.from(files)[0];
    if (!f) return;
    const fd = new FormData();
    fd.set("file", f);
    const json = await uploadAdminMedia(fd);
    if (!json.ok || !json.data?.url) {
      const msg = json.ok ? "Yükleme başarısız." : json.error;
      throw new Error(msg || "Yükleme başarısız.");
    }
    setDraft((v) => ({ ...v, portraitImageUrl: json.data.url ?? "" }));
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-zinc-100">
            Hakkımızda Paneli (Yeni)
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Mevcut sayfayı değiştirmez; sadece içerik kaydı yapar. Sonra bağlarız.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("tr")}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === "tr" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            TR
          </button>
          <button
            type="button"
            onClick={() => setTab("en")}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === "en" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <form
        action={(fd) => {
          setOk(null);
          setErr(null);
          startTransition(async () => {
            fd.set("key", "about");
            fd.set("locale", tab);
            fd.set("data", JSON.stringify(draft));
            const res = await upsertSiteContent(fd);
            if (res.ok) setOk("Kaydedildi.");
            else setErr(res.error ?? "Hata.");
          });
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Firma Hakkında
            </h3>
            <div className="mt-3 grid gap-3">
              <input
                value={draft.visionTitle}
                onChange={(e) => setDraft((v) => ({ ...v, visionTitle: e.target.value }))}
                placeholder="Başlık"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <textarea
                value={draft.visionBody}
                onChange={(e) => setDraft((v) => ({ ...v, visionBody: e.target.value }))}
                placeholder="Açıklama"
                rows={6}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Fotoğraf
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  value={draft.portraitImageUrl}
                  onChange={(e) => setDraft((v) => ({ ...v, portraitImageUrl: e.target.value }))}
                  placeholder="Görsel URL"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900">
                  Cihazdan Yükle
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void uploadSingleImage(e.currentTarget.files).catch((e2) =>
                        setErr(e2 instanceof Error ? e2.message : "Yükleme başarısız."),
                      );
                      e.currentTarget.value = "";
                    }}
                    disabled={pending}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Mimar Bilgileri
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={draft.architectName}
                onChange={(e) => setDraft((v) => ({ ...v, architectName: e.target.value }))}
                placeholder="İsim"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <input
                value={draft.architectRole}
                onChange={(e) => setDraft((v) => ({ ...v, architectRole: e.target.value }))}
                placeholder="Ünvan"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <textarea
                value={draft.architectBio}
                onChange={(e) => setDraft((v) => ({ ...v, architectBio: e.target.value }))}
                placeholder="Bio"
                rows={5}
                className="md:col-span-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            {ok ? <p className="text-xs text-emerald-400">{ok}</p> : null}
            {err ? <p className="text-xs text-red-400">{err}</p> : null}
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
      </form>
    </div>
  );
}

