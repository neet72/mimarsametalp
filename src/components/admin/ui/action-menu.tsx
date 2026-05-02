"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

const MENU_MIN_W_PX = 176;
const EDGE = 10;

export function ActionMenu({
  label = "Aksiyonlar",
  children,
  align = "end",
}: {
  label?: string;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const btnId = useId();
  const ref = useRef<HTMLDivElement | null>(null);
  const menuElRef = useRef<HTMLDivElement | null>(null);
  const [menuRect, setMenuRect] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
    width: number;
    openUp: boolean;
  } | null>(null);

  function computeMenuPlacement() {
    const trigger = ref.current?.querySelector("button") as HTMLButtonElement | null;
    const menuEl = menuElRef.current;
    if (!trigger || !menuEl) return;

    const r = trigger.getBoundingClientRect();
    const h = menuEl.offsetHeight || 260;
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;

    let left = align === "end" ? Math.round(r.right - MENU_MIN_W_PX) : Math.round(r.left);
    left = Math.max(EDGE, Math.min(left, vw - MENU_MIN_W_PX - EDGE));

    const spaceBelow = vh - r.bottom - EDGE;
    const spaceAbove = r.top - EDGE;

    let openUp = false;
    if (spaceBelow < Math.min(h, 220) && spaceAbove > spaceBelow) openUp = true;

    const maxHeight = openUp
      ? Math.max(140, Math.min(420, spaceAbove))
      : Math.max(140, Math.min(420, spaceBelow));

    if (openUp) {
      setMenuRect({
        left,
        bottom: Math.round(vh - r.top + 8),
        maxHeight,
        width: MENU_MIN_W_PX,
        openUp: true,
      });
    } else {
      setMenuRect({
        left,
        top: Math.round(r.bottom + 8),
        maxHeight,
        width: MENU_MIN_W_PX,
        openUp: false,
      });
    }
  }

  useLayoutEffect(() => {
    if (!open) {
      setMenuRect(null);
      return;
    }
    // Two-pass: measure after first paint then refine maxHeight using real height.
    requestAnimationFrame(() => {
      computeMenuPlacement();
      requestAnimationFrame(() => computeMenuPlacement());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, align, children]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => computeMenuPlacement();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      if (menuElRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        id={btnId}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950/40 text-zinc-200",
          "transition-colors hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(166,124,82)]/50",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuElRef}
              role="menu"
              aria-labelledby={btnId}
              style={
                menuRect
                  ? menuRect.openUp
                    ? {
                        position: "fixed",
                        left: menuRect.left,
                        bottom: menuRect.bottom,
                        width: menuRect.width,
                        maxHeight: menuRect.maxHeight,
                        zIndex: 3000,
                      }
                    : {
                        position: "fixed",
                        left: menuRect.left,
                        top: menuRect.top,
                        width: menuRect.width,
                        maxHeight: menuRect.maxHeight,
                        zIndex: 3000,
                      }
                  : { position: "fixed", left: -9999, top: -9999, zIndex: 3000, opacity: 0, pointerEvents: "none" }
              }
              className={cn(
                "overflow-y-auto overflow-x-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-[0_18px_70px_-22px_rgb(0_0_0/0.65)]",
                "pointer-events-auto",
              )}
              onClick={() => setOpen(false)}
            >
              {Children.toArray(children).map((child, idx) => {
                const k = isValidElement(child) ? child.key : null;
                return <Fragment key={k ?? `m-${idx}`}>{child}</Fragment>;
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function ActionMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="menuitem"
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-zinc-200",
        "hover:bg-zinc-900/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

