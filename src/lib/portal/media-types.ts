/** Portal güncelleme medya türleri — admin yükleme + müşteri gösterimi. */

export const PORTAL_IMAGE_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/gif",
] as const;

export const PORTAL_VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const PORTAL_DOC_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
] as const;

export type PortalMediaKind = "image" | "video" | "pdf" | "doc" | "sheet" | "other";

export function isPortalImageMime(type: string) {
  return (PORTAL_IMAGE_MIME as readonly string[]).includes(type) || type.startsWith("image/");
}

export function isPortalVideoMime(type: string) {
  return (PORTAL_VIDEO_MIME as readonly string[]).includes(type) || type.startsWith("video/");
}

export function isPortalDocMime(type: string) {
  return (PORTAL_DOC_MIME as readonly string[]).includes(type);
}

export function isPortalAllowedMime(type: string) {
  return isPortalImageMime(type) || isPortalVideoMime(type) || isPortalDocMime(type);
}

export function portalMediaKindFromMime(type: string): PortalMediaKind {
  if (isPortalImageMime(type)) return "image";
  if (isPortalVideoMime(type)) return "video";
  if (type === "application/pdf") return "pdf";
  if (
    type === "application/msword" ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "doc";
  }
  if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "sheet";
  }
  if (isPortalDocMime(type)) return "other";
  return "other";
}

export function portalMediaKindLabel(kind: string): string {
  switch (kind) {
    case "image":
      return "Görsel";
    case "video":
      return "Video";
    case "pdf":
      return "PDF";
    case "doc":
      return "Word";
    case "sheet":
      return "Excel";
    default:
      return "Dosya";
  }
}

export const PORTAL_ACCEPT_ATTR = [
  "image/*",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

export const MAX_PORTAL_MEDIA_BYTES = 50 * 1024 * 1024;
