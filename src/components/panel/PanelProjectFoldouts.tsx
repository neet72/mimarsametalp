"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  formatWeeksTr,
  projectCategoryTr,
  stageStatusTr,
  summarizeRoadmapByCategory,
} from "@/lib/portal/labels";
import { ChevronDown, Map, Newspaper, Layers } from "lucide-react";
import type { PanelRoadmapItem } from "@/components/panel/PanelProjectRoadmap";

export type PanelFoldoutUpdate = {
  id: string;
  title: string;
  eventDate: string | null;
  publishedAt: string | null;
};

export type PanelFoldoutStage = {
  id: string;
  name: string;
  status: string;
  targetDate: string | null;
};

function FoldSection({
  title,
  count,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const id = useId();
  const panelId = `${id}-panel`;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/90 bg-surface transition-colors",
        open && "border-accent/30 bg-accent/[0.02]",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-12 items-center gap-3 px-3.5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:px-4"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
            open
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-border bg-surface text-muted",
          )}
          aria-hidden
        >
          {open ? "−" : "+"}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="hidden text-accent sm:inline" aria-hidden>
            {icon}
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-primary sm:text-base">
            {title}
          </span>
          {typeof count === "number" ? (
            <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted">
              {count}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180 text-accent",
          )}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="border-t border-border/70 px-3.5 pb-3.5 pt-2 sm:px-4 sm:pb-4"
      >
        {children}
      </div>
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRoadmapRange(startIso: string, endIso: string | null) {
  const start = new Date(startIso);
  const fmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  if (!endIso) return fmt(start);
  return `${fmt(start)} – ${fmt(new Date(endIso))}`;
}

export function PanelProjectFoldouts({
  updates,
  roadmapItems,
  stages,
  updateTotal,
}: {
  updates: PanelFoldoutUpdate[];
  roadmapItems: PanelRoadmapItem[];
  stages: PanelFoldoutStage[];
  updateTotal: number;
}) {
  const [noteOpenId, setNoteOpenId] = useState<string | null>(null);
  const summary = summarizeRoadmapByCategory(
    roadmapItems.map((i) => ({
      category: i.category,
      startDate: i.startDate,
      endDate: i.endDate,
    })),
  );

  return (
    <div className="space-y-2.5">
      <FoldSection
        title="Güncellemeler"
        count={updateTotal}
        icon={<Newspaper className="h-4 w-4" />}
      >
        {updates.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted">Henüz yayınlanmış güncelleme yok.</p>
        ) : (
          <ul className="space-y-1">
            {updates.map((u) => {
              const dateLabel = formatDate(u.eventDate ?? u.publishedAt);
              return (
                <li key={u.id}>
                  <Link
                    href="/panel/guncellemeler"
                    className="group flex items-start gap-2.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-primary group-hover:text-accent">
                        {u.title}
                      </span>
                      {dateLabel ? (
                        <span className="mt-0.5 block text-xs text-muted">{dateLabel}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/panel/guncellemeler"
          className="mt-2 inline-flex min-h-10 items-center text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          Tüm güncellemelere git →
        </Link>
      </FoldSection>

      {roadmapItems.length > 0 ? (
        <FoldSection
          title="Yol haritası"
          count={roadmapItems.length}
          icon={<Map className="h-4 w-4" />}
        >
          {summary.length > 0 ? (
            <ul className="mb-3 flex flex-wrap gap-1.5" aria-label="Kategori süre özeti">
              {summary.map((row) => (
                <li
                  key={row.category}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-primary"
                >
                  <span className="font-semibold text-accent">{row.label}</span>
                  <span className="text-muted"> · </span>
                  {formatWeeksTr(row.weeks)}
                </li>
              ))}
            </ul>
          ) : null}

          <ul className="space-y-1">
            {roadmapItems.map((item) => {
              const hasNote = Boolean(item.note.trim());
              const isOpen = noteOpenId === item.id;
              const dateLabel = formatRoadmapRange(item.startDate, item.endDate);
              const categoryLabel = projectCategoryTr(item.category);

              if (!hasNote) {
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-2.5 rounded-lg px-2 py-2.5"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium uppercase tracking-wider text-accent">
                        {categoryLabel} · {dateLabel}
                      </span>
                      <span className="mt-0.5 block text-sm font-medium text-primary">{item.title}</span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setNoteOpenId(isOpen ? null : item.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors",
                      "hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      isOpen && "bg-accent/[0.04]",
                    )}
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-medium uppercase tracking-wider text-accent">
                        {categoryLabel} · {dateLabel}
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-primary">{item.title}</span>
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200",
                            isOpen && "rotate-180 text-accent",
                          )}
                        />
                      </span>
                      {isOpen ? (
                        <span className="mt-2 block whitespace-pre-wrap text-sm leading-relaxed text-primary/80">
                          {item.note.trim()}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <Link
            href="/panel/sure-takibi"
            className="mt-2 inline-flex min-h-10 items-center text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            Süre takibine git →
          </Link>
        </FoldSection>
      ) : null}

      {stages.length > 0 ? (
        <FoldSection title="Aşamalar" count={stages.length} icon={<Layers className="h-4 w-4" />}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {stages.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-border/70 bg-surface px-3 py-2.5 text-sm"
              >
                <p className="font-medium text-primary">{s.name}</p>
                <p className="mt-0.5 text-xs text-muted">{stageStatusTr(s.status)}</p>
                {s.targetDate ? (
                  <p className="mt-1 text-xs text-muted/80">
                    Hedef: {new Date(s.targetDate).toLocaleDateString("tr-TR")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </FoldSection>
      ) : null}
    </div>
  );
}
