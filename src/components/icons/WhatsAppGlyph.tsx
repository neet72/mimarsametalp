import type { SVGProps } from "react";

export function WhatsAppGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.4 0-2.7-.35-3.85-.95L3 21l1.95-5.65A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 11.5 3 8.5 8.5 0 0 1 21 11.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5c.35 1.1 1.25 2.35 2.35 3.45s2.35 2 3.45 2.35c.4.1.8-.05 1.05-.4l.35-.55c.15-.25.1-.55-.1-.75l-.75-.85a.5.5 0 0 0-.55-.1l-.95.45a.35.35 0 0 1-.4-.05 5.2 5.2 0 0 1-1.1-1.1.35.35 0 0 1-.05-.4l.45-.95a.5.5 0 0 0-.1-.55l-.85-.75c-.2-.2-.5-.25-.75-.1l-.55.35c-.35.25-.5.65-.4 1.05Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
