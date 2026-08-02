import "server-only";

/**
 * Bank-grade baseline: sanitize any HTML before rendering.
 * DOMPurify lazy-load — import crash (jsdom/serverless) sayfayı düşürmesin.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DOMPurify = require("isomorphic-dompurify") as typeof import("isomorphic-dompurify").default;
    return DOMPurify.sanitize(dirty, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "link", "meta"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onmouseenter"],
    });
  } catch {
    return dirty
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
