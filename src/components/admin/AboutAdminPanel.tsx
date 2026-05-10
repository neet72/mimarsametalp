"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Save } from "lucide-react";
import { upsertSiteContent } from "@/actions/admin/site-content";
import { uploadAdminMedia } from "@/actions/admin/upload";
import type { AboutCmsDraft } from "@/lib/site-content/about-cms";

type Locale = "tr" | "en";

type AboutDraft = AboutCmsDraft;

const emptyDraft: AboutDraft = {
  heroVideoUrl: "",
  heroPosterUrl: "",
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
      throw new Error("Yükleme başarısız.");
    }
    setDraft((v) => ({ ...v, portraitImageUrl: json.data!.url ?? "" }));
  }

  async function uploadHeroVideo(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = Array.from(files)[0];
    if (!f) return;
    const fd = new FormData();
    fd.set("file", f);
    const json = await uploadAdminMedia(fd);
    if (!json.ok || !json.data?.url) {
      throw new Error(json.ok ? "Video yüklenemedi." : json.error ?? "Video yüklenemedi.");
    }
    setDraft((v) => ({ ...v, heroVideoUrl: json.data!.url ?? "" }));
  }

  async function uploadHeroPoster(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = Array.from(files)[0];
    if (!f) return;
    const fd = new FormData();
    fd.set("file", f);
    const json = await uploadAdminMedia(fd);
    if (!json.ok || !json.data?.url) {
      throw new Error("Kapak yüklenemedi.");
    }
    setDraft((v) => ({ ...v, heroPosterUrl: json.data!.url ?? "" }));
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-zinc-100">
            Hakkımızda
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Üstteki <span className="text-zinc-300">video ve kapak</span>,{" "}
            <span className="text-zinc-300">vizyon metni</span> ve{" "}
            <span className="text-zinc-300">mimar portresi</span> kaydedilir; /hakkimizda ve
            /en/hakkimizda canlı güncellenir. Boş metin alanları sitedeki varsayılan metinleri kullanır.
            Video/kapak ve portre için bir dilde yüklemeniz yeter; diğer dil boşsa aynı URL iki yerde de
            kullanılabilir. Yüklemeler Cloudinary üzerindedir (projelerle aynı).
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Üst alan — döngü videosu ve kapak
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              Sitede en üstteki geniş video ve (&quot;kapak&quot;) video yüklenene kadar gösterilecek yatay görsel.
              <span className="text-zinc-500">
                {" "}
                Mimari portre fotoğrafıyla aynı dosyayı buraya koymayın — önce portre, sonra video geliyormuş gibi
                görünür.
              </span>{" "}
              MP4 Cloudinary veya tam URL; kapak için geniş/yatay kare önerilir. Boş bırakırsanız video için{" "}
              <code className="rounded bg-zinc-900 px-1 py-0.5 text-[11px] text-zinc-400">/videos/about-hero.mp4</code>{" "}
              kullanılır.
            </p>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Video (MP4) — URL veya yükle
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={draft.heroVideoUrl}
                    onChange={(e) => setDraft((v) => ({ ...v, heroVideoUrl: e.target.value }))}
                    placeholder="https://... veya /videos/..."
                    className="min-w-[12rem] flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900">
                    Video yükle
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        void uploadHeroVideo(e.currentTarget.files).catch((e2) =>
                          setErr(e2 instanceof Error ? e2.message : "Yükleme başarısız."),
                        );
                        e.currentTarget.value = "";
                      }}
                      disabled={pending}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Kapak (poster) — URL veya yükle
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={draft.heroPosterUrl}
                    onChange={(e) => setDraft((v) => ({ ...v, heroPosterUrl: e.target.value }))}
                    placeholder="https://... (yatay görsel)"
                    className="min-w-[12rem] flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900">
                    Görsel yükle
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void uploadHeroPoster(e.currentTarget.files).catch((e2) =>
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
            {draft.heroVideoUrl.trim() || draft.heroPosterUrl.trim() ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {draft.heroVideoUrl.trim() ? (
                  <div className="overflow-hidden rounded-lg border border-zinc-800 bg-black/40">
                    <video
                      key={draft.heroVideoUrl.trim()}
                      className="aspect-[16/10] w-full object-cover object-center"
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      src={draft.heroVideoUrl.trim()}
                    />
                  </div>
                ) : null}
                {draft.heroPosterUrl.trim() ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
                    <Image
                      src={draft.heroPosterUrl.trim()}
                      alt="Kapak önizleme"
                      fill
                      className="object-cover object-center"
                      sizes="(max-width:768px) 100vw, 400px"
                      unoptimized={
                        draft.heroPosterUrl.startsWith("http") || draft.heroPosterUrl.startsWith("//")
                      }
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-12">
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

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Mimar bilgileri ve portre
            </h3>
            <p className="mt-1 text-xs text-zinc-600">
              Hakkımızda sayfasında mimar metninin yanındaki büyük fotoğrafı buradan değiştirirsiniz.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-start">
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Portre — URL veya yükleme
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={draft.portraitImageUrl}
                    onChange={(e) => setDraft((v) => ({ ...v, portraitImageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="min-w-[12rem] flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
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
              <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
                {draft.portraitImageUrl.trim() ? (
                  <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] min-h-[200px]">
                    <Image
                      src={draft.portraitImageUrl.trim()}
                      alt="Portre önizleme"
                      fill
                      unoptimized
                      className="object-cover object-[center_22%]"
                      sizes="220px"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[3/4] max-h-52 items-center justify-center p-4 text-center text-[11px] text-zinc-600 lg:max-h-none lg:min-h-[200px]">
                    Önizleme; URL yapıştırın veya yükleyin
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
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

