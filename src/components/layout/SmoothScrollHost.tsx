"use client";

import { useSmoothScroll } from "@/hooks/useSmoothScroll";

/** Public layout’ta tek Lenis örneği — sayfa bileşenlerinde tekrarlanmaz. */
export function SmoothScrollHost() {
  useSmoothScroll();
  return null;
}
