import "server-only";

import DOMPurify from "isomorphic-dompurify";

/**
 * Bank-grade baseline: sanitize any HTML before rendering.
 * Default policy is strict and safe for rich text (no scripts/events).
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    // Hard blocks (defense in depth).
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "link", "meta"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onmouseenter"],
  });
}

