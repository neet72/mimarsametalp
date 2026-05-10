import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { SERVICES_GALLERY as SERVICES_GALLERY_TR } from "@/content/services-gallery";
import { SERVICES_GALLERY as SERVICES_GALLERY_EN } from "@/content/services-gallery.en";
import type { ServiceListingItem } from "@/lib/service-listing-item";

export type { ServiceListingItem };

function galleryMap(locale: "tr" | "en") {
  const list = locale === "en" ? SERVICES_GALLERY_EN : SERVICES_GALLERY_TR;
  return new Map(list.map((g) => [g.slug, g]));
}

function staticFallback(locale: "tr" | "en"): ServiceListingItem[] {
  const list = locale === "en" ? SERVICES_GALLERY_EN : SERVICES_GALLERY_TR;
  return list.map((g) => ({ slug: g.slug, title: g.title, imageUrl: g.imageUrl }));
}

async function fetchServiceListingItems(locale: "tr" | "en"): Promise<ServiceListingItem[]> {
  const trMap = galleryMap("tr");
  const enMap = galleryMap("en");

  try {
    const rows = (await prisma.service.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { slug: true, title: true, titleEn: true, heroImageUrl: true },
    } as Parameters<typeof prisma.service.findMany>[0])) as Array<{
      slug: string;
      title: string;
      titleEn: string | null;
      heroImageUrl: string | null;
    }>;

    if (rows.length === 0) {
      return staticFallback(locale);
    }

    return rows.map((row) => {
      const hero = row.heroImageUrl?.trim();
      const statTr = trMap.get(row.slug);
      const statEn = enMap.get(row.slug);

      let title: string;
      if (locale === "en") {
        const fromDb = row.titleEn?.trim();
        title = fromDb || statEn?.title || row.title.trim() || statTr?.title || row.slug;
      } else {
        title = row.title.trim() || statTr?.title || statEn?.title || row.slug;
      }

      const imageUrl = hero || statTr?.imageUrl || statEn?.imageUrl || "/images/hero-1.webp";

      return { slug: row.slug, title, imageUrl };
    });
  } catch {
    return staticFallback(locale);
  }
}

const getCachedTr = unstable_cache(
  () => fetchServiceListingItems("tr"),
  ["service-listing", "tr", "v2"],
  { revalidate: 60, tags: ["public-services"] },
);

const getCachedEn = unstable_cache(
  () => fetchServiceListingItems("en"),
  ["service-listing", "en", "v2"],
  { revalidate: 60, tags: ["public-services"] },
);

export async function getServiceListingItems(locale: "tr" | "en"): Promise<ServiceListingItem[]> {
  return locale === "en" ? getCachedEn() : getCachedTr();
}
