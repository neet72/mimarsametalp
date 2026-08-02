"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { renderMarkdownSafe } from "@/lib/portal/markdown";
import { shouldUnoptimizeImage } from "@/lib/media/next-image";
import { panelFieldClass } from "@/lib/portal/labels";
import { portalMediaKindLabel } from "@/lib/portal/media-types";
import { withCloudinaryAttachment } from "@/lib/storage/cloudinary-url";
import { FileText } from "lucide-react";

export type PanelUpdateItem = {
  id: string;
  title: string;
  body: string;
  publishedAt: string | null;
  project: { id: string; title: string };
  stage: { name: string } | null;
  media: Array<{
    id: string;
    cloudinaryUrl: string;
    mediaType: string;
    caption: string | null;
  }>;
};

function mediaDownloadName(m: PanelUpdateItem["media"][number]) {
  if (m.caption?.trim()) return m.caption.trim();
  const ext =
    m.mediaType === "pdf"
      ? ".pdf"
      : m.mediaType === "doc"
        ? ".docx"
        : m.mediaType === "sheet"
          ? ".xlsx"
          : "";
  return `${portalMediaKindLabel(m.mediaType)}${ext}`;
}

export function PanelUpdatesFeed({ updates }: { updates: PanelUpdateItem[] }) {
  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of updates) map.set(u.project.id, u.project.title);
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [updates]);

  const [projectId, setProjectId] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return updates.filter((u) => {
      if (projectId !== "all" && u.project.id !== projectId) return false;
      if (!needle) return true;
      return (
        u.title.toLocaleLowerCase("tr").includes(needle) ||
        u.project.title.toLocaleLowerCase("tr").includes(needle) ||
        u.body.toLocaleLowerCase("tr").includes(needle)
      );
    });
  }, [updates, projectId, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1 text-sm">
          <span className="mb-1 block text-muted">Ara</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Başlık veya içerik…"
            className={panelFieldClass}
            aria-label="Güncellemelerde ara"
          />
        </label>
        {projects.length > 1 ? (
          <label className="block text-sm sm:w-56">
            <span className="mb-1 block text-muted">Proje</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={panelFieldClass}
              aria-label="Projeye göre filtrele"
            >
              <option value="all">Tümü</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <p className="text-xs text-muted" aria-live="polite">
        {filtered.length} / {updates.length} güncelleme
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface/80 px-5 py-10 text-center text-sm text-muted">
          Bu filtreye uyan güncelleme yok.
        </p>
      ) : (
        <ol className="relative space-y-0 border-l border-border/80 pl-6 sm:pl-8">
          {filtered.map((u, i) => (
            <li key={u.id} className={cn("relative pb-10 last:pb-0", i === 0 && "pt-0")}>
              <span
                aria-hidden
                className="absolute -left-[1.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-surface sm:-left-[2.05rem]"
              />
              <article className="rounded-2xl border border-border bg-surface/80 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium uppercase tracking-wider text-accent">{u.project.title}</span>
                  {u.stage?.name ? (
                    <span className="rounded-full bg-primary/5 px-2.5 py-0.5 text-muted">{u.stage.name}</span>
                  ) : null}
                  {u.publishedAt ? (
                    <time className="text-muted" dateTime={u.publishedAt}>
                      {new Date(u.publishedAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  ) : null}
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-primary">{u.title}</h2>
                <div
                  className="prose-panel mt-4 text-sm leading-relaxed text-primary/90"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(u.body) }}
                />
                {u.media.length ? (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {u.media.map((m) => (
                      <li key={m.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                        {m.mediaType === "image" ? (
                          <a
                            href={m.cloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="relative block aspect-[4/3]"
                          >
                            <Image
                              src={m.cloudinaryUrl}
                              alt={m.caption ?? u.title}
                              fill
                              unoptimized={shouldUnoptimizeImage(m.cloudinaryUrl)}
                              className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                              sizes="(max-width: 768px) 50vw, 300px"
                            />
                          </a>
                        ) : m.mediaType === "video" ? (
                          <video src={m.cloudinaryUrl} controls className="aspect-video w-full bg-black" />
                        ) : (
                          <a
                            href={withCloudinaryAttachment(m.cloudinaryUrl, mediaDownloadName(m))}
                            download={mediaDownloadName(m)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-h-[8rem] flex-col items-center justify-center gap-2 px-4 py-6 text-center transition-colors hover:bg-primary/[0.03]"
                          >
                            <FileText className="h-7 w-7 text-accent" aria-hidden />
                            <span className="text-sm font-medium text-accent underline-offset-2 hover:underline">
                              {m.caption || portalMediaKindLabel(m.mediaType)}
                            </span>
                            <span className="text-xs text-muted">{portalMediaKindLabel(m.mediaType)} · indir / aç</span>
                          </a>
                        )}
                        {m.caption && m.mediaType === "image" ? (
                          <p className="border-t border-border px-3 py-2 text-xs text-muted">{m.caption}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
