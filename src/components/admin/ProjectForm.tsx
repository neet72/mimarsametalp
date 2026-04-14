"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createProject, updateProject } from "@/actions/admin/projects";
import { ADMIN_PROJECT_CATEGORIES } from "@/lib/admin/project-categories";
import type { Project } from "@prisma/client";
import { slugify } from "@/lib/slugify";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/cn";

function formatImageUrls(raw: string): string {
  try {
    const arr = JSON.parse(raw) as unknown;
    if (Array.isArray(arr)) return arr.map(String).join("\n");
  } catch {
    /* ignore */
  }
  return "";
}

function parseLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toLines(urls: string[]): string {
  return urls.join("\n");
}

type Mode = "create" | "edit";

export default function ProjectForm({
  mode,
  project,
}: {
  mode: Mode;
  project?: Project;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState(project?.category ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState(project?.status ?? "");
  const [year, setYear] = useState(project?.year ? String(project.year) : "");
  const [location, setLocation] = useState(project?.location ?? "");
  const [areaM2, setAreaM2] = useState(project?.areaM2 ? String(project.areaM2) : "");
  const [imageUrlsRaw, setImageUrlsRaw] = useState(
    project?.imageUrls ? formatImageUrls(project.imageUrls) : "/images/hero-1.webp",
  );
  const [published, setPublished] = useState(project?.published ?? false);
  const [sortOrder, setSortOrder] = useState(String(project?.sortOrder ?? 0));
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit") setSlugTouched(true);
  }, [mode]);

  useEffect(() => {
    if (slugTouched) return;
    const next = slugify(title).toLowerCase();
    setSlug(next);
  }, [title, slugTouched]);

  const imageUrls = useMemo(() => parseLines(imageUrlsRaw), [imageUrlsRaw]);
  const coverUrl = imageUrls[0] ?? "/images/hero-1.webp";

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", f);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = (await res.json()) as { ok: boolean; url?: string; error?: string; warning?: string };
        if (!res.ok || !json.ok || !json.url) {
          throw new Error(json.error || "Yükleme başarısız.");
        }
        if (json.warning) setUploadError(json.warning);
        urls.push(json.url);
      }
      setImageUrlsRaw((prev) => {
        const current = parseLines(prev);
        return toLines([...current, ...urls]);
      });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    if (mode === "edit" && project) fd.set("id", project.id);
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("category", category);
    fd.set("description", description);
    fd.set("status", status);
    fd.set("year", year);
    fd.set("location", location);
    fd.set("areaM2", areaM2);
    fd.set("imageUrlsText", imageUrlsRaw);
    fd.set("sortOrder", sortOrder);
    if (published) fd.set("published", "on");
    return fd;
  }

  return (
    <form
      className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        startTransition(async () => {
          const fd = buildFormData();
          const res = mode === "create" ? await createProject(fd) : await updateProject(fd);
          if (!res.ok) {
            setError(res.error ?? "İşlem başarısız.");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fe = (res as any).fieldErrors as Record<string, string[] | undefined> | undefined;
            if (fe) {
              const cleaned: Record<string, string[]> = {};
              for (const [k, v] of Object.entries(fe)) {
                if (v && v.length) cleaned[k] = v;
              }
              setFieldErrors(cleaned);
            }
            return;
          }
          router.push("/admin/projects");
          router.refresh();
        });
      }}
    >
      <div className="space-y-6">
        {error ? (
          <p className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Durum</p>
              <p className="mt-1 text-sm text-zinc-300">
                {published ? "Yayında" : "Taslak"} • Sıra: <span className="text-zinc-100">{sortOrder || "0"}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Yayında
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Sıra</span>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Başlık</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                fieldErrors.title ? "border-red-800/70" : "border-zinc-700",
              )}
            />
            {fieldErrors.title?.[0] ? (
              <p className="text-xs text-red-300">{fieldErrors.title[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Slug</label>
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(true);
                  setSlug(slugify(title).toLowerCase());
                }}
                className="text-xs font-medium text-[rgb(200,170,130)] hover:underline"
              >
                Başlıktan üret
              </button>
            </div>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="örn: cukurova-villa"
              className={cn(
                "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                fieldErrors.slug ? "border-red-800/70" : "border-zinc-700",
              )}
            />
            {slug ? (
              <p className="text-xs text-zinc-500">
                Public URL: <span className="text-zinc-300">/projeler/{slug}</span>
              </p>
            ) : null}
            {fieldErrors.slug?.[0] ? (
              <p className="text-xs text-red-300">{fieldErrors.slug[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">—</option>
              {ADMIN_PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              className={cn(
                "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                fieldErrors.description ? "border-red-800/70" : "border-zinc-700",
              )}
            />
            {fieldErrors.description?.[0] ? (
              <p className="text-xs text-red-300">{fieldErrors.description[0]}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:col-span-2 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Durum</label>
              <input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="örn: Tamamlandı / Devam ediyor"
                className={cn(
                  "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                  fieldErrors.status ? "border-red-800/70" : "border-zinc-700",
                )}
              />
              {fieldErrors.status?.[0] ? <p className="text-xs text-red-300">{fieldErrors.status[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Yıl</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="örn: 2026"
                className={cn(
                  "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                  fieldErrors.year ? "border-red-800/70" : "border-zinc-700",
                )}
              />
              {fieldErrors.year?.[0] ? <p className="text-xs text-red-300">{fieldErrors.year[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Konum</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="örn: Adana"
                className={cn(
                  "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                  fieldErrors.location ? "border-red-800/70" : "border-zinc-700",
                )}
              />
              {fieldErrors.location?.[0] ? <p className="text-xs text-red-300">{fieldErrors.location[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Alan (m²)</label>
              <input
                type="number"
                value={areaM2}
                onChange={(e) => setAreaM2(e.target.value)}
                placeholder="örn: 180"
                className={cn(
                  "w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100",
                  fieldErrors.areaM2 ? "border-red-800/70" : "border-zinc-700",
                )}
              />
              {fieldErrors.areaM2?.[0] ? <p className="text-xs text-red-300">{fieldErrors.areaM2[0]}</p> : null}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Görsel Galerisi</p>
              <p className="mt-1 text-sm text-zinc-400">
                İlk görsel kapak olarak kullanılır. URL veya <span className="font-mono">/public</span> yolu gir.
              </p>
            </div>
            {slug ? (
              <a
                href={`/projeler/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Public’te Gör
              </a>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  URL ile ekle veya cihazdan yükle
                </p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900">
                  <UploadCloud className="h-4 w-4" aria-hidden />
                  {uploading ? "Yükleniyor…" : "Cihazdan Yükle"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      void uploadFiles(e.currentTarget.files);
                      e.currentTarget.value = "";
                    }}
                    disabled={pending || uploading}
                  />
                </label>
              </div>

              {uploadError ? (
                <p className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-300">
                  {uploadError}
                </p>
              ) : null}

              <div className="flex gap-2">
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const u = newImageUrl.trim();
                    if (!u) return;
                    setImageUrlsRaw((prev) => {
                      const current = parseLines(prev);
                      return toLines([...current, u]);
                    });
                    setNewImageUrl("");
                  }}
                  placeholder="Yeni görsel URL’i ekle…"
                  className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    const u = newImageUrl.trim();
                    if (!u) return;
                    setImageUrlsRaw((prev) => {
                      const current = parseLines(prev);
                      return toLines([...current, u]);
                    });
                    setNewImageUrl("");
                  }}
                  disabled={pending}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[rgb(166,124,82)] px-3 text-sm font-semibold text-zinc-950"
                >
                  <ImagePlus className="h-4 w-4" aria-hidden />
                  Ekle
                </button>
              </div>

              <textarea
                value={imageUrlsRaw}
                onChange={(e) => setImageUrlsRaw(e.target.value)}
                rows={9}
                className={cn(
                  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200",
                  fieldErrors.imageUrlsText ? "border-red-800/70" : "border-zinc-700",
                )}
              />
              {fieldErrors.imageUrlsText?.[0] ? (
                <p className="text-xs text-red-300">{fieldErrors.imageUrlsText[0]}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                <Image src={coverUrl} alt="Kapak" fill sizes="420px" className="object-cover object-center" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Kapak</p>
                  <p className="mt-1 line-clamp-1 text-sm font-medium text-white">{title || "Başlık"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {imageUrls.slice(0, 9).map((src, idx) => (
                  <div key={`${src}-${idx}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                    <Image src={src} alt="" fill sizes="140px" className="object-cover object-center" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/35" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...imageUrls];
                          const [moved] = next.splice(idx, 1);
                          next.unshift(moved);
                          setImageUrlsRaw(toLines(next));
                        }}
                        className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white hover:bg-white/15"
                      >
                        Kapak
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const next = [...imageUrls];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            setImageUrlsRaw(toLines(next));
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/15 disabled:opacity-40"
                          aria-label="Yukarı taşı"
                        >
                          <ArrowUp className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          disabled={idx === imageUrls.length - 1}
                          onClick={() => {
                            if (idx >= imageUrls.length - 1) return;
                            const next = [...imageUrls];
                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                            setImageUrlsRaw(toLines(next));
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/15 disabled:opacity-40"
                          aria-label="Aşağı taşı"
                        >
                          <ArrowDown className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = imageUrls.filter((_, i) => i !== idx);
                            setImageUrlsRaw(toLines(next));
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white hover:bg-red-500/20"
                          aria-label="Sil"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                    <div className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                      {idx === 0 ? "Kapak" : `#${idx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[rgb(166,124,82)] px-6 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            {pending ? "Kaydediliyor…" : mode === "create" ? "Oluştur" : "Güncelle"}
          </button>
        </div>
      </div>

      {/* Sağ panel: hızlı özet / preview */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Önizleme</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <div className="relative aspect-video">
              <Image src={coverUrl} alt="" fill sizes="420px" className="object-cover object-center" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  {category || "Kategori"}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{title || "Proje başlığı"}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">
                {description || "Açıklama…"}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>{published ? "Yayında" : "Taslak"}</span>
                <span>Görsel: {imageUrls.length}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
