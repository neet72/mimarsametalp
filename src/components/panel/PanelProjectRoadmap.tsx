"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

export type PanelRoadmapItem = {
  id: string;
  title: string;
  note: string;
  startDate: string;
  endDate: string | null;
};

function formatRoadmapRange(startIso: string, endIso: string | null) {
  const start = new Date(startIso);
  const sameDayFmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  if (!endIso) return sameDayFmt(start);

  const end = new Date(endIso);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.getDate()}–${end.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  }
  if (sameYear) {
    return `${start.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} – ${sameDayFmt(end)}`;
  }
  return `${sameDayFmt(start)} – ${sameDayFmt(end)}`;
}

export function PanelProjectRoadmap({ items }: { items: PanelRoadmapItem[] }) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`${baseId}-heading`} className="space-y-3">
      <h4 id={`${baseId}-heading`} className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Yol haritası
      </h4>
      <ol className="relative space-y-0 border-l border-border/80 pl-5 sm:pl-6">
        {items.map((item) => {
          const hasNote = Boolean(item.note.trim());
          const isOpen = openId === item.id;
          const panelId = `${baseId}-note-${item.id}`;
          const dateLabel = formatRoadmapRange(item.startDate, item.endDate);

          return (
            <li key={item.id} className="relative pb-4 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[1.35rem] top-2 h-2.5 w-2.5 rounded-full border-2 border-accent bg-surface sm:-left-[1.6rem]"
              />
              {hasNote ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className={cn(
                    "group flex w-full flex-col rounded-xl border border-border bg-surface px-3.5 py-3 text-left transition-colors",
                    "hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    isOpen && "border-accent/40 bg-accent/[0.03]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-accent">{dateLabel}</p>
                      <p className="mt-1 font-display text-sm font-semibold tracking-tight text-primary sm:text-base">
                        {item.title}
                      </p>
                    </div>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
                        isOpen && "rotate-180 text-accent",
                      )}
                    />
                  </div>
                  <div
                    id={panelId}
                    hidden={!isOpen}
                    className="mt-3 overflow-hidden border-t border-border/70 pt-3 text-sm leading-relaxed text-primary/85"
                  >
                    <p className="whitespace-pre-wrap">{item.note.trim()}</p>
                  </div>
                </button>
              ) : (
                <div className="rounded-xl border border-border/80 bg-surface/80 px-3.5 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-accent">{dateLabel}</p>
                  <p className="mt-1 font-display text-sm font-semibold tracking-tight text-primary sm:text-base">
                    {item.title}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
