import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/hizmetlerimiz/ServiceDetailClient";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps, serviceJsonLd } from "@/lib/seo-jsonld";
import { SERVICES_DETAIL } from "@/content/services-detail.en";
import { getPublicServiceBySlug } from "@/lib/public/services";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const enBrand = "Samet Alp Architecture";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const key = String(slug ?? "").trim().toLowerCase();
  const db = key ? await getPublicServiceBySlug(key) : null;
  const staticService = SERVICES_DETAIL[slug];

  const merged =
    staticService != null
      ? {
          slug: staticService.slug,
          name: db?.title ?? staticService.name,
          shortDescription:
            (db?.shortDescription && String(db.shortDescription).trim()) || staticService.shortDescription,
          heroImageUrl: db?.heroImageUrl ?? staticService.heroImageUrl,
        }
      : db
        ? {
            slug: db.slug,
            name: db.title,
            shortDescription: db.shortDescription ?? "Service details — Samet Alp Architecture, Adana.",
            heroImageUrl: db.heroImageUrl ?? undefined,
          }
        : null;

  if (!merged) {
    const fallbackTitle = `Services | ${enBrand}`;
    const fallbackDescription =
      "Explore architecture, interior design, and turnkey services from our Adana studio — Samet Alp Architecture.";
    return {
      ...pageMetadata({
        title: "Services",
        description: fallbackDescription,
        path: "/en/hizmetlerimiz",
      }),
      title: { absolute: fallbackTitle },
      description: fallbackDescription,
    };
  }

  const title = merged.name;
  const rawDesc = String(merged.shortDescription ?? "").trim();
  const description = (rawDesc || `${title} — ${enBrand}, Adana.`).slice(0, 200);
  const absoluteTitle = `${title} | ${enBrand}`;
  const img = merged.heroImageUrl;

  return {
    ...pageMetadata({
      title,
      description,
      path: `/en/hizmetlerimiz/${merged.slug}`,
    }),
    title: { absolute: absoluteTitle },
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      title: absoluteTitle,
      description,
      url: `/en/hizmetlerimiz/${merged.slug}`,
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

export default async function ServiceDetailPageEn({ params }: PageProps) {
  const { slug } = await params;
  const service = SERVICES_DETAIL[slug];
  if (!service) notFound();

  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Services", path: "/en/hizmetlerimiz" },
            { name: service.name, path: `/en/hizmetlerimiz/${service.slug}` },
          ]),
        )}
      />
      <script
        key="jsonld-service"
        {...jsonLdScriptProps(
          serviceJsonLd({
            name: service.name,
            description: service.shortDescription,
            path: `/en/hizmetlerimiz/${service.slug}`,
            imageUrl: service.heroImageUrl,
          }),
        )}
      />
      <ServiceDetailClient service={service} />
    </>
  );
}

