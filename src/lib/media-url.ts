/**
 * Galeri/medya URL'lerinde görsel mi video mu ayırt etmek için.
 * Cloudinary video upload ve doğrudan .mp4/.webm vb. desteklenir.
 */
export function isVideoUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const path = trimmed.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp4|webm|mov|m4v|ogv)(\b|$)/i.test(path)) return true;
  if (/cloudinary\.com.*\/video\/upload/i.test(trimmed)) return true;
  return false;
}

/** Kapak / OG / küçük önizleme için: mümkünse ilk görsel; yoksa boş (çağıran video fallback kullanır). */
export function firstImageUrl(urls: string[]): string | undefined {
  for (const u of urls) {
    if (typeof u === "string") {
      const t = u.trim();
      if (t && !isVideoUrl(t)) return t;
    }
  }
  return undefined;
}
