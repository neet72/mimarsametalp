import type { ReactNode } from "react";

/** Soft-nav içerik sarmalı — Framer AnimatePresence kaldırıldı (asılı opacity bug’ı). */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
