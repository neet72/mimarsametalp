/**
 * Cloudinary delivery URL yardımcıları (client + server güvenli).
 * İndirmede tarayıcının UUID yerine okunabilir dosya adı kullanması için.
 */

/** MIME → varsayılan uzantı (orijinal ad yoksa). */
const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "text/plain": ".txt",
};

export function extensionFromFilenameOrMime(filename?: string | null, mimeType?: string | null): string {
  const fromName = filename?.trim().match(/(\.[a-zA-Z0-9]{1,10})$/)?.[1];
  if (fromName) return fromName.toLowerCase();
  if (mimeType && MIME_EXT[mimeType]) return MIME_EXT[mimeType];
  return "";
}

/** İndirme / kaydetme için güvenli dosya adı (path traversal yok). */
export function safeDownloadFilename(raw: string | null | undefined, fallback = "dosya"): string {
  const base = (raw?.trim() || fallback)
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120)
    .trim();
  return base || fallback;
}

/**
 * Cloudinary URL’ye `fl_attachment` ekler.
 * Türkçe / özel karakterler için URL-safe Base64 (aksi halde HTTP 400).
 */
export function withCloudinaryAttachment(url: string, filename: string): string {
  const safe = safeDownloadFilename(filename);
  if (!url.includes("/upload/") || !safe) return url;
  if (/\/upload\/[^/]*fl_attachment/.test(url)) return url;

  const b64 = toCloudinaryUrlSafeBase64(safe);
  if (!b64) return url;
  return url.replace("/upload/", `/upload/fl_attachment:b64_${b64}/`);
}

/** Cloudinary fl_attachment için URL-safe Base64 (padding yok). */
function toCloudinaryUrlSafeBase64(text: string): string {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    const b64 =
      typeof btoa === "function"
        ? btoa(binary)
        : Buffer.from(text, "utf8").toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  } catch {
    return "";
  }
}

/** Görsel/video delivery URL’lerine f_auto,q_auto ekler (raw dokunulmaz). */
export function withCloudinaryAutoFormat(url: string): string {
  if (!url.includes("/upload/") || url.includes("/raw/upload/")) return url;
  if (url.includes("f_auto") || url.includes("q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
