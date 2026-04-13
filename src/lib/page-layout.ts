/**
 * Widescreen içerik alanı — max genişlik + yan padding (tüm sayfa bileşenlerinde tutarlı).
 */
export const PAGE_MAX_CLASS = "max-w-[1600px]";

/** Mobil dar ekranlarda biraz daha geniş dokunma alanı; üst kırılımlarla uyumlu */
export const PAGE_PAD_X =
  "px-4 min-[400px]:px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20";

export const pageContainerClass = `mx-auto w-full ${PAGE_MAX_CLASS} ${PAGE_PAD_X}`;
