import { sanitizeHtml } from "@/lib/security/sanitize-html";
import { cn } from "@/lib/cn";

export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = sanitizeHtml(html);
  return (
    <div
      className={cn(className)}
      // Sanitized on server before render.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

