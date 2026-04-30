import type { Metadata } from "next";

export const siteName = "Samet Alp Mimarlık";

const fallbackSiteUrl = "https://www.mimarsametalp.com";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? fallbackSiteUrl;
}

export const metadataBase = new URL(getSiteUrl());

type PageMetaInput = {
  title: string;
  description: string;
  path: `/${string}`;
};

function toTrPath(path: `/${string}`) {
  return (path.startsWith("/en/") ? (path.slice(3) as `/${string}`) : path) as `/${string}`;
}

function toEnPath(path: `/${string}`) {
  if (path === "/") return "/en";
  return (path.startsWith("/en/") ? path : (`/en${path}` as `/${string}`)) as `/${string}`;
}

/**
 * Sayfa bazlı metadata — Open Graph ve Twitter kartları portföy siteleri için hazır.
 * Görseller eklendiğinde `openGraph.images` burada veya sayfada genişletilebilir.
 */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = path;
  const isEn = path === "/en" || path.startsWith("/en/");
  const trPath = toTrPath(path);
  const enPath = toEnPath(path);
  const fullTitle = `${title} | ${siteName}`;
  const ogTitle = encodeURIComponent(fullTitle.slice(0, 72));
  const ogDesc = encodeURIComponent(description.slice(0, 120));
  const ogPath = isEn ? "/en/opengraph-image" : "/opengraph-image";
  const ogUrl = `${ogPath}?title=${ogTitle}&desc=${ogDesc}`;
  const base = getSiteUrl();

  const abs = (p: string) => `${base}${p === "/" ? "/" : p}`;

  return {
    title,
    description,
    alternates: {
      canonical: abs(url),
      languages: {
        "tr-TR": abs(trPath),
        tr: abs(trPath),
        "en-US": abs(enPath),
        en: abs(enPath),
        "x-default": abs(trPath),
      },
    },
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "tr_TR",
      siteName,
      title: fullTitle,
      description,
      url: abs(url),
      images: [{ url: ogUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogUrl],
    },
  };
}
