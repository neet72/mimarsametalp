"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProject, updateProject } from "@/actions/admin/projects";
import { ADMIN_PROJECT_CATEGORIES } from "@/lib/admin/project-categories";
import type { Project } from "@prisma/client";

function formatImageUrls(raw: string): string {
  try {
    const arr = JSON.parse(raw) as unknown;
    if (Array.isArray(arr)) return arr.map(String).join("\n");
  } catch {
    /* ignore */
  }
  return "";
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

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [imageUrlsRaw, setImageUrlsRaw] = useState(
    project?.imageUrls ? formatImageUrls(project.imageUrls) : "/images/hero-1.webp",
  );
  const [published, setPublished] = useState(project?.published ?? false);
  const [sortOrder, setSortOrder] = useState(String(project?.sortOrder ?? 0));

  function buildFormData(): FormData {
    const fd = new FormData();
    if (mode === "edit" && project) fd.set("id", project.id);
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("category", category);
    fd.set("description", description);
    fd.set("imageUrlsText", imageUrlsRaw);
    fd.set("sortOrder", sortOrder);
    if (published) fd.set("published", "on");
    return fd;
  }

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const fd = buildFormData();
          const res = mode === "create" ? await createProject(fd) : await updateProject(fd);
          if (!res.ok) {
            setError(res.error ?? "İşlem başarısız.");
            return;
          }
          router.push("/admin/projects");
          router.refresh();
        });
      }}
    >
      {error ? (
        <p className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Başlık</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Boş bırakılırsa başlıktan üretilir"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </div>

      <div className="space-y-2">
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

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Açıklama</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Görsel yolları (satır başına bir URL veya /public yolu)
        </label>
        <textarea
          value={imageUrlsRaw}
          onChange={(e) => setImageUrlsRaw(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Yayında
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Sıra</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[rgb(166,124,82)] px-6 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : mode === "create" ? "Oluştur" : "Güncelle"}
      </button>
    </form>
  );
}
