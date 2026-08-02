/** next/image remotePatterns ile uyumlu mu? Değilse unoptimized kullan. */
export function shouldUnoptimizeImage(src: string): boolean {
  if (!src || typeof src !== "string") return true;
  if (src.startsWith("/") || src.startsWith("data:")) return false;
  if (!/^https?:\/\//i.test(src)) return true;
  try {
    const host = new URL(src).hostname.toLowerCase();
    return host !== "res.cloudinary.com" && !host.endsWith(".cloudinary.com");
  } catch {
    return true;
  }
}
