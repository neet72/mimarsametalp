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

/**
 * Sayfa bazlı metadata — Open Graph ve Twitter kartları portföy siteleri için hazır.
 * Görseller eklendiğinde `openGraph.images` burada veya sayfada genişletilebilir.
 */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = path;
  const fullTitle = `${title} · ${siteName}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName,
      title: fullTitle,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
