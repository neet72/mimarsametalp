"use client";

import type { ReactNode } from "react";

/**
 * Framer `AnimatePresence` + `motion` sarmalı, App Router istemci geçişlerinde ara sıra bileşeni
 * opaklık/transform’da “asılı” bırakıyordu; scroll reflow ile ancak düzeliyordu.
 * İçerik şimdi doğrudan React/Next süzümü ile değişir; daha öngörülebilir.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

