"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { renderMarkdownSafe } from "@/lib/portal/markdown";
import { shouldUnoptimizeImage } from "@/lib/media/next-image";
import { panelFieldClass } from "@/lib/portal/labels";
import { portalMediaKindLabel } from "@/lib/portal/media-types";
import { withCloudinaryAttachment } from "@/lib/storage/cloudinary-url";
import { AlertCircle, ChevronDown, FileText, MessageSquarePlus } from "lucide-react";

export type PanelUpdateItem = {
  id: string;
  title: string;
  body: string;
  publishedAt: string | null;
  eventDate: string | null;
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

function requestHref(u: PanelUpdateItem, kind: "hata" | "istek") {
  const subject =
    kind === "hata"
      ? `Hata bildirimi: ${u.title}`
      : `İstek: ${u.title}`;
  const message =
    kind === "hata"
      ? `Merhaba,\n\n“${u.title}” güncellemesiyle ilgili bir sorun / hata bildirmek istiyorum:\n\n`
      : `Merhaba,\n\n“${u.title}” güncellemesiyle ilgili bir isteğim var:\n\n`;
  const params = new URLSearchParams({
    projectId: u.project.id,
    subject,
    message,
    from: u.id,
  });
  return `/panel/istekler?${params.toString()}`;
}

export function PanelUpdatesFeed({ updates }: { updates: PanelUpdateItem[] }) {
  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of updates) map.set(u.project.id, u.project.title);
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [updates]);

  const [projectId, setProjectId] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-surface via-surface to-accent/[0.04] p-4 sm:p-5">
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
        <p className="mt-3 text-xs text-muted" aria-live="polite">
          {filtered.length} / {updates.length} güncelleme · Bir güncellemede sorun görürseniz hemen
          bildirebilirsiniz.
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface/60 px-5 py-12 text-center text-sm text-muted">
          Bu filtreye uyan güncelleme yok.
        </p>
      ) : (
        <ol className="space-y-3 sm:space-y-4">
          {filtered.map((u) => {
            const isOpen = openId === u.id;
            const panelId = `update-panel-${u.id}`;
            return (
              <li key={u.id}>
                <article
                  className={cn(
                    "overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_-28px_rgb(15_23_42/0.45)] transition-colors",
                    isOpen && "border-accent/35",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : u.id)}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:px-6 sm:py-5"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold",
                        isOpen
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-border bg-surface text-muted",
                      )}
                      aria-hidden
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-accent/10 px-2.5 py-1 font-semibold uppercase tracking-wider text-accent">
                          {u.project.title}
                        </span>
                        {u.stage?.name ? (
                          <span className="rounded-full bg-primary/5 px-2.5 py-0.5 text-muted">
                            {u.stage.name}
                          </span>
                        ) : null}
                        {u.eventDate || u.publishedAt ? (
                          <time
                            className="text-muted"
                            dateTime={u.eventDate ?? u.publishedAt ?? undefined}
                          >
                            {new Date(u.eventDate ?? u.publishedAt!).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </time>
                        ) : null}
                      </span>
                      <span className="mt-2 block font-display text-lg font-semibold tracking-tight text-primary sm:text-xl">
                        {u.title}
                      </span>
                      {!isOpen ? (
                        <span className="mt-1 block text-xs text-muted">Detayı görmek için dokunun</span>
                      ) : null}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
                        isOpen && "rotate-180 text-accent",
                      )}
                    />
                  </button>

                  <div id={panelId} hidden={!isOpen}>
                    <div className="border-t border-border/70 px-4 py-5 sm:px-6">
                      <div
                        className="prose-panel text-sm leading-relaxed text-primary/90 sm:text-[0.95rem]"
                        dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(u.body) }}
                      />

                      {u.media.length ? (
                        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {u.media.map((m) => (
                            <li
                              key={m.id}
                              className="overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
                            >
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
                                <video
                                  src={m.cloudinaryUrl}
                                  controls
                                  className="aspect-video w-full bg-black"
                                />
                              ) : (
                                <a
                                  href={withCloudinaryAttachment(m.cloudinaryUrl, mediaDownloadName(m))}
                                  download={mediaDownloadName(m)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex min-h-[8rem] flex-col items-center justify-center gap-2 px-4 py-6 text-center transition-colors hover:bg-primary/[0.03]"
                                >
                                  <FileText className="h-7 w-7 text-accent" aria-hidden />
                                  <span className="line-clamp-2 text-sm font-medium text-accent underline-offset-2 hover:underline">
                                    {m.caption || portalMediaKindLabel(m.mediaType)}
                                  </span>
                                  <span className="text-xs text-muted">
                                    {portalMediaKindLabel(m.mediaType)} · indir / aç
                                  </span>
                                </a>
                              )}
                              {m.caption && m.mediaType === "image" ? (
                                <p className="border-t border-border px-3 py-2 text-xs text-muted">
                                  {m.caption}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <footer className="flex flex-col gap-2 border-t border-border/70 bg-primary/[0.015] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <p className="text-xs text-muted">Bir sorun veya isteğiniz mi var?</p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={requestHref(u, "hata")}
                          className={cn(
                            "inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-primary",
                            "transition-colors hover:border-accent/40 hover:text-accent",
                          )}
                        >
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                          Hata bildir
                        </Link>
                        <Link
                          href={requestHref(u, "istek")}
                          className={cn(
                            "inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-3 text-xs font-semibold text-white",
                            "transition-opacity hover:opacity-90",
                          )}
                        >
                          <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
                          İstek gönder
                        </Link>
                      </div>
                    </footer>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
