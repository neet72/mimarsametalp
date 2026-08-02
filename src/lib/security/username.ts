/** Türkçe harfleri ASCII’ye çevir, boşluk → nokta, küçük harf. */
export function normalizeUsername(raw: string): string {
  let s = raw.trim();
  // toLowerCase öncesi: İ/I Türkçe sorunlarını atla
  s = s
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .toLowerCase();
  s = s
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]+/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^[._-]+|[._-]+$/g, "");
  return s;
}
