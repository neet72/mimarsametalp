"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  createdAt: number;
};

type ToastContextValue = {
  push: (t: Omit<ToastItem, "id" | "createdAt"> & { durationMs?: number }) => void;
};

const ToastCtx = createContext<ToastContextValue | null>(null);

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const remove = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) window.clearTimeout(t);
    timers.current.delete(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<ToastItem, "id" | "createdAt"> & { durationMs?: number }) => {
      const id = uid();
      const durationMs = Math.max(1200, Math.min(8000, t.durationMs ?? 3200));
      const item: ToastItem = { id, createdAt: Date.now(), type: t.type, title: t.title, description: t.description };
      setItems((prev) => [item, ...prev].slice(0, 4));
      const tm = window.setTimeout(() => remove(id), durationMs);
      timers.current.set(id, tm);
    },
    [remove],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[999] flex w-[min(420px,92vw)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-xl border p-4 shadow-[0_18px_70px_-22px_rgb(0_0_0/0.65)] backdrop-blur-sm",
              "bg-zinc-950/70",
              t.type === "success" && "border-emerald-500/25",
              t.type === "error" && "border-red-500/25",
              t.type === "info" && "border-white/15",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-100">{t.title}</p>
                {t.description ? <p className="mt-1 text-xs text-zinc-400">{t.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    return {
      success: (x: { title: string; description?: string }) => {
        void x;
      },
      error: (x: { title: string; description?: string }) => {
        void x;
      },
      info: (x: { title: string; description?: string }) => {
        void x;
      },
    };
  }
  return {
    success: (x: { title: string; description?: string }) => ctx.push({ type: "success", ...x }),
    error: (x: { title: string; description?: string }) => ctx.push({ type: "error", ...x }),
    info: (x: { title: string; description?: string }) => ctx.push({ type: "info", ...x }),
  };
}

