"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type AdminJumpItem = {
  id: string;
  label: string;
};

/** Uzun portal proje detayında mobilde yatay, web’de sticky bölüm atlama. */
export function AdminSectionJumpNav({ items }: { items: AdminJumpItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id;
        if (top) setActive(top);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Sayfa bölümleri"
      className="sticky top-0 z-20 -mx-1 border-b border-zinc-800/80 bg-zinc-950/90 px-1 py-2 backdrop-blur-md sm:top-2 sm:mx-0 sm:rounded-xl sm:border sm:px-2"
    >
      <ul className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                onClick={() => setActive(item.id)}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(166,124,82)]/40 sm:text-sm",
                  isActive
                    ? "bg-[rgb(166,124,82)]/15 text-[rgb(200,170,130)]"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
