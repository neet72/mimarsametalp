import type { SVGProps } from "react";

export function LinkedinGlyph({ strokeWidth: _strokeWidth = 1.9, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      {/* Brand-like mark: "in" inside rounded square */}
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
      <path
        d="M7.25 10.2h2.1v7.1h-2.1v-7.1Zm1.05-3.55c.75 0 1.36.6 1.36 1.34 0 .74-.61 1.34-1.36 1.34-.75 0-1.36-.6-1.36-1.34 0-.74.61-1.34 1.36-1.34Z"
        fill="rgb(var(--color-surface-rgb) / 0.96)"
      />
      <path
        d="M11.1 10.2h2.02v.97c.46-.7 1.23-1.15 2.36-1.15 2.02 0 3.22 1.24 3.22 3.46v3.82h-2.1v-3.4c0-1.46-.56-2.29-1.72-2.29-1.26 0-1.68.9-1.68 2.29v3.4h-2.1v-7.1Z"
        fill="rgb(var(--color-surface-rgb) / 0.96)"
      />
    </svg>
  );
}
