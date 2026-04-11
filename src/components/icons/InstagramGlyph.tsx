import type { SVGProps } from "react";

/** Lucide eski sürümlerde Instagram yok; marka uyumlu basit glif. */
export function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}
