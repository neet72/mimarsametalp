"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { ServiceDbRow } from "@/types/service-db";
import { createService, updateService } from "@/actions/admin/services";
import { uploadAdminMedia } from "@/actions/admin/upload";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/cn";
import { CheckCircle2, ChevronDown, Circle, Plus, Save, Trash2, UploadCloud } from "lucide-react";

type Mode = "create" | "edit";

type LocaleTab = "tr" | "en";

type ProcessStep = { title: string; description: string };
type FaqItem = { question: string; answer: string };

function parseScope(raw: string | null | undefined): string[] {
  try {
    const p = JSON.parse(raw ?? "[]") as unknown;
    if (Array.isArray(p) && p.every((x) => typeof x === "string")) {
      return p.length > 0 ? p : [""];
    }
  } catch {
    /* ignore */
  }
  return [""];
}

function parseProcess(raw: string | null | undefined): ProcessStep[] {
  try {
    const p = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(p) || p.length === 0) return [{ title: "", description: "" }];
    return p.map((x) => {
      const o = x && typeof x === "object" ? (x as Record<string, unknown>) : {};
      return {
        title: String(o.title ?? "").trim(),
        description: String(o.description ?? "").trim(),
      };
    });
  } catch {
    return [{ title: "", description: "" }];
  }
}

function parseFaq(raw: string | null | undefined): FaqItem[] {
  try {
    const p = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(p) || p.length === 0) return [{ question: "", answer: "" }];
    return p.map((x) => {
      const o = x && typeof x === "object" ? (x as Record<string, unknown>) : {};
      return {
        question: String(o.question ?? "").trim(),
        answer: String(o.answer ?? "").trim(),
      };
    });
  } catch {
    return [{ question: "", answer: "" }];
  }
}

export default function ServiceForm({ mode, service }: { mode: Mode; service?: ServiceDbRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [localeTab, setLocaleTab] = useState<LocaleTab>("tr");

  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [shortDescription, setShortDescription] = useState(service?.shortDescription ?? "");
  const [titleEn, setTitleEn] = useState(service?.titleEn ?? "");
  const [shortDescriptionEn, setShortDescriptionEn] = useState(service?.shortDescriptionEn ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(service?.heroImageUrl ?? "");
  const [published, setPublished] = useState(service?.published ?? false);
  const [sortOrder, setSortOrder] = useState(String(service?.sortOrder ?? 0));

  const [scope, setScope] = useState<string[]>(() => parseScope(service?.scope ?? undefined));
  const [scopeEn, setScopeEn] = useState<string[]>(() => {
    const tr = parseScope(service?.scope ?? undefined);
    const en = parseScope(service?.scopeEn ?? undefined);
    return tr.map((_, i) => en[i] ?? "");
  });
  const [process, setProcess] = useState<ProcessStep[]>(() => parseProcess(service?.process ?? undefined));
  const [processEn, setProcessEn] = useState<ProcessStep[]>(() => {
    const tr = parseProcess(service?.process ?? undefined);
    const en = parseProcess(service?.processEn ?? undefined);
    return tr.map((_, i) => en[i] ?? { title: "", description: "" });
  });
  const [faq, setFaq] = useState<FaqItem[]>(() => parseFaq(service?.faq ?? undefined));
  const [faqEn, setFaqEn] = useState<FaqItem[]>(() => {
    const tr = parseFaq(service?.faq ?? undefined);
    const en = parseFaq(service?.faqEn ?? undefined);
    return tr.map((_, i) => en[i] ?? { question: "", answer: "" });
  });

  useEffect(() => {
    setScopeEn((prev) => scope.map((_, i) => prev[i] ?? ""));
  }, [scope]);

  useEffect(() => {
    setProcessEn((prev) => process.map((_, i) => prev[i] ?? { title: "", description: "" }));
  }, [process]);

  useEffect(() => {
    setFaqEn((prev) => faq.map((_, i) => prev[i] ?? { question: "", answer: "" }));
  }, [faq]);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  /** Yeni kayıtta formu sade tut; düzenlemede tüm bloklar açık gelsin. */
  const [detailsOpen, setDetailsOpen] = useState(mode === "edit");

  useEffect(() => {
    if (slugTouched) return;
    const next = slugify(title).toLowerCase();
    setSlug(next);
  }, [title, slugTouched]);

  const coverPreview = useMemo(() => {
    const u = heroImageUrl.trim();
    return u || "/images/hero-1.webp";
  }, [heroImageUrl]);

  const previewTitle = useMemo(() => {
    if (localeTab === "en") return titleEn.trim() || title.trim() || "Başlık";
    return title.trim() || "Başlık";
  }, [localeTab, title, titleEn]);

  const previewShort = useMemo(() => {
    if (localeTab === "en") {
      return (
        shortDescriptionEn.trim() || shortDescription.trim() || "Kısa açıklama burada görünür."
      );
    }
    return shortDescription.trim() || "Kısa açıklama burada görünür.";
  }, [localeTab, shortDescription, shortDescriptionEn]);

  const checklist = useMemo(
    () => [
      { ok: title.trim().length >= 2, label: "Başlık en az 2 karakter" },
      { ok: slug.trim().length > 0, label: "Web adresi (slug) dolu" },
      { ok: heroImageUrl.trim().length > 0, label: "Kapak görseli eklendi (isteğe bağlı öneri)" },
    ],
    [title, slug, heroImageUrl],
  );

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
      if (!json.ok || !json.data?.url) {
        const msg = json.ok ? "Yükleme başarısız." : json.error;
        throw new Error(msg || "Yükleme başarısız.");
      }
      setHeroImageUrl(json.data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    if (mode === "edit" && service) fd.set("id", service.id);
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("shortDescription", shortDescription);
    fd.set("titleEn", titleEn);
    fd.set("shortDescriptionEn", shortDescriptionEn);
    fd.set("heroImageUrl", heroImageUrl);
    fd.set("sortOrder", sortOrder);
    if (published) fd.set("published", "on");

    const scopeTr: string[] = [];
    const scopeEnAligned: string[] = [];
    for (let i = 0; i < scope.length; i++) {
      const t = scope[i]!.trim();
      if (!t) continue;
      scopeTr.push(t);
      scopeEnAligned.push((scopeEn[i] ?? "").trim());
    }
    fd.set("scopeJson", JSON.stringify(scopeTr));
    fd.set("scopeJsonEn", JSON.stringify(scopeEnAligned));

    const processTr: ProcessStep[] = [];
    const processEnAligned: ProcessStep[] = [];
    for (let i = 0; i < process.length; i++) {
      const tr = process[i]!;
      if (!(tr.title.trim() || tr.description.trim())) continue;
      processTr.push({ title: tr.title.trim(), description: tr.description.trim() });
      const en = processEn[i] ?? { title: "", description: "" };
      processEnAligned.push({ title: en.title.trim(), description: en.description.trim() });
    }
    fd.set("processJson", JSON.stringify(processTr));
    fd.set("processJsonEn", JSON.stringify(processEnAligned));

    const faqTr: FaqItem[] = [];
    const faqEnAligned: FaqItem[] = [];
    for (let i = 0; i < faq.length; i++) {
      const tr = faq[i]!;
      if (!(tr.question.trim() || tr.answer.trim())) continue;
      faqTr.push({ question: tr.question.trim(), answer: tr.answer.trim() });
      const en = faqEn[i] ?? { question: "", answer: "" };
      faqEnAligned.push({ question: en.question.trim(), answer: en.answer.trim() });
    }
    fd.set("faqJson", JSON.stringify(faqTr));
    fd.set("faqJsonEn", JSON.stringify(faqEnAligned));
    return fd;
  }

  return (
    <form
      className="grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        startTransition(async () => {
          const fd = buildFormData();
          const res = mode === "create" ? await createService(fd) : await updateService(fd);
          if (!res.ok) {
            setError(res.error ?? "İşlem başarısız.");
            const fe = "fieldErrors" in res ? (res.fieldErrors as Record<string, string[] | undefined> | undefined) : undefined;
            if (fe) {
              const cleaned: Record<string, string[]> = {};
              for (const [k, v] of Object.entries(fe)) {
                if (v && v.length) cleaned[k] = v;
              }
              setFieldErrors(cleaned);
            }
            return;
          }
          router.push("/admin/services");
          router.refresh();
        });
      }}
    >
      <div className="space-y-6">
        {error ? (
          <p className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            <span className="font-medium text-red-200">Kayıt tamamlanamadı. </span>
            {error}
          </p>
        ) : null}

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Yayın durumu</p>
              <p className="mt-1 text-sm text-zinc-300">
                Şu an: <span className="font-medium text-zinc-100">{published ? "Ziyaretçiye açık" : "Sadece panelde (taslak)"}</span>
                {" · "}
                Listede sıra numarası: <span className="text-zinc-100">{sortOrder || "0"}</span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                «Yayında» işaretli değilse bu hizmet sitede listelenmez ve sayfası ziyaretçiye kapalıdır. Taslakta
                bırakıp sonra işaretleyebilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 accent-[rgb(166,124,82)]"
                />
                Sitede yayınla
              </label>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs text-zinc-500">Listede sıra</span>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-describedby="sort-order-hint"
                  className="w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100"
                />
              </div>
            </div>
          </div>
          <p id="sort-order-hint" className="mt-3 text-xs text-zinc-600">
            Küçük sayı üstte gösterilir (0, 1, 2…). Yukarı taşımak için rakamı küçültün.
          </p>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">İçerik dili</p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
              Önce <span className="text-zinc-300">TR</span> ile kaydet veya doldur;{" "}
              <span className="text-zinc-300">EN</span> sekmesinde yalnızca metinleri çevir. Slug ve kapak görseli her iki
              dilde ortaktır — EN’de yeniden yükleme gerekmez.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocaleTab("tr")}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                localeTab === "tr" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900",
              )}
            >
              TR
            </button>
            <button
              type="button"
              onClick={() => setLocaleTab("en")}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                localeTab === "en" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900",
              )}
            >
              EN
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Web adresi (slug)
              </label>
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(true);
                  setSlug(slugify(title).toLowerCase());
                }}
                className="text-xs font-medium text-[rgb(200,170,130)] hover:underline"
              >
                Başlıktan otomatik yaz
              </button>
            </div>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="ornek-hizmet-slug"
              autoComplete="off"
              className={cn(
                "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                fieldErrors.slug ? "border-red-800/70" : "border-zinc-700",
              )}
            />
            <p className="text-xs leading-relaxed text-zinc-500">
              Sitedeki adres kısımıdır; boşluk kullanmayın, Türkçe harf yerine normal harf ve tire (-) tercih edin.
              Kayıtlı başka bir hizmetle aynı olamaz.
            </p>
            {slug ? (
              <p className="text-xs text-zinc-400">
                Önizleme adresleri:{" "}
                <span className="text-zinc-200">/hizmetlerimiz/{slug.trim().toLowerCase()}</span>
                {" · "}
                <span className="text-zinc-200">/en/hizmetlerimiz/{slug.trim().toLowerCase()}</span>
              </p>
            ) : null}
            {fieldErrors.slug?.[0] ? <p className="text-xs text-red-300">{fieldErrors.slug[0]}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Kapak (hero) görseli</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://… veya /uploads/…"
                className={cn(
                  "min-w-0 flex-1 rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                  fieldErrors.heroImageUrl ? "border-red-800/70" : "border-zinc-700",
                )}
              />
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900">
                <UploadCloud className="h-4 w-4" aria-hidden />
                {uploading ? "Yükleniyor…" : "Bilgisayardan yükle"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={pending || uploading}
                  onChange={(e) => {
                    void uploadFiles(e.currentTarget.files);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              JPG veya PNG yükleyebilirsiniz; yükleme bitince satırdaki kutuya adres yazılır. İsterseniz başka yerde
              barındırdığınız görselin tam bağlantısını da yapıştırabilirsiniz.
            </p>
            {uploadError ? <p className="text-xs text-red-400">{uploadError}</p> : null}
            {fieldErrors.heroImageUrl?.[0] ? (
              <p className="text-xs text-red-300">{fieldErrors.heroImageUrl[0]}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          {localeTab === "tr" ? (
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(200,170,130)]">Türkçe metin</p>
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Hizmet başlığı</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Örn: "Anahtar teslim mimarlık"'
                  className={cn(
                    "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                    fieldErrors.title ? "border-red-800/70" : "border-zinc-700",
                  )}
                />
                <p className="text-xs leading-relaxed text-zinc-500">
                  Ziyaretçinin gördüğü isim (/hizmetlerimiz). Slug çoğu zaman başlıktan otomatik üretilir.
                </p>
                {fieldErrors.title?.[0] ? <p className="text-xs text-red-300">{fieldErrors.title[0]}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Kısa açıklama</label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={3}
                  placeholder="Listede görünecek 1–2 cümle (isteğe bağlı)"
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
                {fieldErrors.shortDescription?.[0] ? (
                  <p className="text-xs text-red-300">{fieldErrors.shortDescription[0]}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(200,170,130)]">English</p>
              <p className="text-xs text-zinc-500">
                /en/hizmetlerimiz için. Boş bırakırsan sitede Türkçe metin gösterilir; görsel ve slug yukarıda ortaktır.
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Title</label>
                <input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Service title in English"
                  className={cn(
                    "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                    fieldErrors.titleEn ? "border-red-800/70" : "border-zinc-700",
                  )}
                />
                {fieldErrors.titleEn?.[0] ? <p className="text-xs text-red-300">{fieldErrors.titleEn[0]}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Short description</label>
                <textarea
                  value={shortDescriptionEn}
                  onChange={(e) => setShortDescriptionEn(e.target.value)}
                  rows={3}
                  placeholder="Summary for listing (optional)"
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
                {fieldErrors.shortDescriptionEn?.[0] ? (
                  <p className="text-xs text-red-300">{fieldErrors.shortDescriptionEn[0]}</p>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40">
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <div>
              <p className="font-display text-sm font-semibold text-zinc-100">İsteğe bağlı detaylar</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Kapsam maddeleri, süreç adımları ve sık sorulanlar — hepsi detay sayfasında çıkar; boş bırakmak sorun
                değildir.
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {detailsOpen ? (
            <div className="space-y-6 border-t border-zinc-800 px-5 pb-5 pt-4">
              <p className="text-xs leading-relaxed text-zinc-500">
                Bu bölümü atlayıp doğrudan «Kaydet» diyebilirsiniz; hizmet yine oluşur. Doldurursanız ziyaretçi detay
                sayfasında maddeli liste olarak görür.
              </p>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                      Hizmet kapsamı {localeTab === "en" ? "(EN)" : "(TR)"}
                    </h3>
                    {localeTab === "en" ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        Madde sayısı ve sırası Türkçe sekmesindekiyle aynıdır; burada çeviriyi yaz.
                      </p>
                    ) : null}
                  </div>
                  {localeTab === "tr" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setScope((v) => [...v, ""]);
                        setScopeEn((v) => [...v, ""]);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Madde ekle
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 space-y-2">
                  {scope.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={localeTab === "tr" ? val : scopeEn[idx] ?? ""}
                        onChange={(e) => {
                          if (localeTab === "tr") {
                            const next = [...scope];
                            next[idx] = e.target.value;
                            setScope(next);
                          } else {
                            const next = [...scopeEn];
                            next[idx] = e.target.value;
                            setScopeEn(next);
                          }
                        }}
                        placeholder={
                          localeTab === "tr" ? "Kapsam maddesi…" : `EN çeviri (TR: ${val.trim() || "—"})`
                        }
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      />
                      {localeTab === "tr" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setScope((v) => v.filter((_, i) => i !== idx));
                            setScopeEn((v) => v.filter((_, i) => i !== idx));
                          }}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                          aria-label="Sil"
                          disabled={scope.length === 1}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      ) : (
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-zinc-600">
                          ·
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                      Hizmet süreci {localeTab === "en" ? "(EN)" : "(TR)"}
                    </h3>
                    {localeTab === "en" ? (
                      <p className="mt-1 text-xs text-zinc-500">Adım sayısı Türkçe ile aynı; çeviriyi gir.</p>
                    ) : null}
                  </div>
                  {localeTab === "tr" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProcess((v) => [...v, { title: "", description: "" }]);
                        setProcessEn((v) => [...v, { title: "", description: "" }]);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Adım ekle
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {process.map((step, idx) => {
                    const enStep = processEn[idx] ?? { title: "", description: "" };
                    const showTr = localeTab === "tr";
                    return (
                      <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Adım {String(idx + 1).padStart(2, "0")}
                          </p>
                          {showTr ? (
                            <button
                              type="button"
                              onClick={() => {
                                setProcess((v) => v.filter((_, i) => i !== idx));
                                setProcessEn((v) => v.filter((_, i) => i !== idx));
                              }}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                              aria-label="Sil"
                              disabled={process.length === 1}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </button>
                          ) : null}
                        </div>
                        <input
                          value={showTr ? step.title : enStep.title}
                          onChange={(e) => {
                            if (showTr) {
                              const next = [...process];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setProcess(next);
                            } else {
                              const next = [...processEn];
                              next[idx] = { ...(next[idx] ?? { title: "", description: "" }), title: e.target.value };
                              setProcessEn(next);
                            }
                          }}
                          placeholder={showTr ? "Başlık" : `Title (TR: ${step.title.trim() || "—"})`}
                          className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                        />
                        <textarea
                          value={showTr ? step.description : enStep.description}
                          onChange={(e) => {
                            if (showTr) {
                              const next = [...process];
                              next[idx] = { ...next[idx], description: e.target.value };
                              setProcess(next);
                            } else {
                              const next = [...processEn];
                              next[idx] = {
                                ...(next[idx] ?? { title: "", description: "" }),
                                description: e.target.value,
                              };
                              setProcessEn(next);
                            }
                          }}
                          placeholder={showTr ? "Açıklama" : `Description (TR: ${step.description.trim().slice(0, 80) || "—"})`}
                          rows={3}
                          className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                      SSS {localeTab === "en" ? "(EN)" : "(TR)"}
                    </h3>
                    {localeTab === "en" ? (
                      <p className="mt-1 text-xs text-zinc-500">Soru sayısı Türkçe ile aynı.</p>
                    ) : null}
                  </div>
                  {localeTab === "tr" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFaq((v) => [...v, { question: "", answer: "" }]);
                        setFaqEn((v) => [...v, { question: "", answer: "" }]);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Soru ekle
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 space-y-3">
                  {faq.map((item, idx) => {
                    const enItem = faqEn[idx] ?? { question: "", answer: "" };
                    const showTr = localeTab === "tr";
                    return (
                      <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Soru {String(idx + 1).padStart(2, "0")}
                          </p>
                          {showTr ? (
                            <button
                              type="button"
                              onClick={() => {
                                setFaq((v) => v.filter((_, i) => i !== idx));
                                setFaqEn((v) => v.filter((_, i) => i !== idx));
                              }}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                              aria-label="Sil"
                              disabled={faq.length === 1}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </button>
                          ) : null}
                        </div>
                        <input
                          value={showTr ? item.question : enItem.question}
                          onChange={(e) => {
                            if (showTr) {
                              const next = [...faq];
                              next[idx] = { ...next[idx], question: e.target.value };
                              setFaq(next);
                            } else {
                              const next = [...faqEn];
                              next[idx] = { ...(next[idx] ?? { question: "", answer: "" }), question: e.target.value };
                              setFaqEn(next);
                            }
                          }}
                          placeholder={showTr ? "Soru" : `Question (TR: ${item.question.trim().slice(0, 60) || "—"})`}
                          className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                        />
                        <textarea
                          value={showTr ? item.answer : enItem.answer}
                          onChange={(e) => {
                            if (showTr) {
                              const next = [...faq];
                              next[idx] = { ...next[idx], answer: e.target.value };
                              setFaq(next);
                            } else {
                              const next = [...faqEn];
                              next[idx] = { ...(next[idx] ?? { question: "", answer: "" }), answer: e.target.value };
                              setFaqEn(next);
                            }
                          }}
                          placeholder={showTr ? "Cevap" : `Answer (TR: ${item.answer.trim().slice(0, 80) || "—"})`}
                          rows={3}
                          className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-[rgb(166,124,82)] px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {pending ? "Kaydediliyor…" : "Kaydet ve listeye dön"}
          </button>
          <Link
            href="/admin/services"
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
          >
            İptal, listeye dön
          </Link>
          <p className="w-full text-xs text-zinc-600 sm:w-auto sm:pl-2">
            Kaydettiğinizde değişiklikler kaybolmaz; istediğiniz zaman tekrar düzenleyebilirsiniz.
          </p>
        </div>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
          <p className="border-b border-zinc-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Önizleme (temsili)
          </p>
          <div className="relative aspect-[16/10] w-full bg-zinc-900">
            <Image
              src={coverPreview}
              alt={previewTitle}
              fill
              sizes="360px"
              className="object-cover object-center"
            />
          </div>
          <div className="space-y-2 p-4">
            <p className="font-display text-sm font-semibold text-zinc-100">{previewTitle}</p>
            <p className="line-clamp-4 text-xs leading-relaxed text-zinc-500">{previewShort}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              Önizleme dili: {localeTab === "en" ? "EN" : "TR"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Kaydetmeden önce</p>
          <ul className="mt-3 space-y-2 text-sm">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-zinc-400">
                {c.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/90" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
                )}
                <span className={c.ok ? "text-zinc-300" : ""}>{c.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-600">
            Üçüncü madde isteğe bağlıdır. Yeşil tikler tamamen dolu değilse de kayıt çalışabilir; sadece hazırlık
            için rehberdir.
          </p>
        </div>
      </aside>
    </form>
  );
}
