import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/hizmetlerimiz/ServiceDetailClient";
import { pageMetadata, siteName } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps, serviceJsonLd } from "@/lib/seo-jsonld";
import { getPublicServiceBySlug } from "@/lib/public/services";
import { resolveServiceDetailData } from "@/lib/public/resolve-service-detail";
import { getServiceListingItems } from "@/lib/public/service-listing";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const key = String(slug ?? "").trim().toLowerCase();
  const db = key ? await getPublicServiceBySlug(key) : null;
  const resolved = resolveServiceDetailData(key, "tr", db);
  if (!resolved) {
    const fallbackTitle = `Hizmetlerimiz | ${siteName}`;
    const fallbackDescription =
      "Adana mimarlık ofisi Samet Alp Mimarlık: mimari tasarım, iç mimarlık ve anahtar teslim hizmetlerimizi keşfedin.";
    return {
      ...pageMetadata({
        title: "Hizmetlerimiz",
        description: fallbackDescription,
        path: "/hizmetlerimiz",
      }),
      title: { absolute: fallbackTitle },
      description: fallbackDescription,
    };
  }

  const title = resolved.name;
  const rawDesc = String(resolved.shortDescription ?? "").trim();
  const description = (rawDesc || `${resolved.name} — ${siteName}, Adana.`).slice(0, 200);
  const absoluteTitle = `${title} | ${siteName}`;
  const img = resolved.heroImageUrl;

  return {
    ...pageMetadata({
      title,
      description,
      path: `/hizmetlerimiz/${resolved.slug}`,
    }),
    title: { absolute: absoluteTitle },
    description,
    openGraph: {
      type: "website",
      locale: "tr_TR",
      title: absoluteTitle,
      description,
      url: `/hizmetlerimiz/${resolved.slug}`,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
      images: img ? [img] : undefined,
    },
  };
}

export default async function HizmetDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const key = String(slug ?? "").trim().toLowerCase();
  const db = key ? await getPublicServiceBySlug(key) : null;
  const service = resolveServiceDetailData(key, "tr", db);
  if (!service) notFound();

  const listing = await getServiceListingItems("tr");
  const relatedServices = listing
    .filter((s) => s.slug !== service.slug)
    .slice(0, 6)
    .map((s) => ({ title: s.title, href: `/hizmetlerimiz/${s.slug}` }));
  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hizmetlerimiz", path: "/hizmetlerimiz" },
            { name: service.name, path: `/hizmetlerimiz/${service.slug}` },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          serviceJsonLd({
            name: service.name,
            description: service.shortDescription,
            path: `/hizmetlerimiz/${service.slug}`,
            imageUrl: service.heroImageUrl,
            inLanguage: "tr-TR",
            dateModified: db?.updatedAt ?? null,
          }),
        )}
      />
      <ServiceDetailClient service={service} relatedServices={relatedServices} />
    </div>
  );
}

