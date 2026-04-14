import type { SVGProps } from "react";

export function WhatsAppGlyph({ strokeWidth = 2, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      {/* Outline bubble (logo-like) */}
      <path
        d="M12 3.25c4.85 0 8.75 3.61 8.75 8.06S16.85 19.38 12 19.38c-1.47 0-2.85-.33-4.06-.92L3.5 20.75l1.47-4.05a7.74 7.74 0 0 1-1.72-4.39C3.25 6.86 7.15 3.25 12 3.25Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handset (filled) */}
      <path
        d="M9.37 9.17c-.22-.48-.46-.49-.67-.5h-.57c-.19 0-.51.08-.77.35-.26.28-1.02.99-1.02 2.41 0 1.43 1.04 2.81 1.19 3 .15.2 2.01 3.06 4.95 4.17 2.45.92 2.95.74 3.48.69.53-.05 1.73-.7 1.98-1.38.25-.68.25-1.26.17-1.38-.08-.12-.26-.2-.56-.35l-1.71-.83c-.19-.1-.33-.14-.48.14-.14.28-.56 1.38-.69 1.66-.12.28-.24.35-.45.24-.22-.1-.91-.33-1.73-1.06-.64-.58-1.07-1.29-1.19-1.5-.12-.22-.02-.33.1-.43.1-.1.22-.24.34-.37.12-.13.14-.22.22-.37.08-.14.03-.28-.01-.37l-.76-1.82Z"
        fill="currentColor"
        transform="translate(1.25 -0.55) scale(0.8)"
      />
    </svg>
  );
}
