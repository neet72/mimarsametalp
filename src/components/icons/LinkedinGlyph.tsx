import type { SVGProps } from "react";

export function LinkedinGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="7" cy="7" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20.25h4V11H5v9.25Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M13 11v1.5c.8-1.5 2.8-1.6 3.8-.5 1 .9 1.2 2.4 1.2 3.75V20.25h4V11h-4v1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
