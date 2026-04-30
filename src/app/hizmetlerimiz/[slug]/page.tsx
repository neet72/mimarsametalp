import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/hizmetlerimiz/ServiceDetailClient";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps, serviceJsonLd } from "@/lib/seo-jsonld";
import { SERVICES_DETAIL } from "@/content/services-detail";
import { getPublicServiceBySlug } from "@/lib/public/services";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const key = String(slug ?? "").trim().toLowerCase();
  // Prefer DB-backed cached service (Cloudinary hero image included), fallback to in-code content.
  const db = key ? await getPublicServiceBySlug(key) : null;
  const service = db
    ? {
        slug: db.slug,
        name: db.title,
        shortDescription: db.shortDescription ?? "Hizmet detayı.",
        heroImageUrl: db.heroImageUrl ?? undefined,
      }
    : SERVICES_DETAIL[slug];
  if (!service) {
    return pageMetadata({
      title: "Hizmet Detayı",
      description: "Hizmet detayı.",
      path: "/hizmetlerimiz",
    });
  }

  const title = service.name;
  const description = service.shortDescription.slice(0, 180);
  const img = service.heroImageUrl;

  return {
    ...pageMetadata({
      title,
      description,
      path: `/hizmetlerimiz/${service.slug}`,
    }),
    openGraph: {
      type: "website",
      locale: "tr_TR",
      title: `${title} · Samet Alp Mimarlık`,
      description,
      url: `/hizmetlerimiz/${service.slug}`,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Samet Alp Mimarlık`,
      description,
      images: img ? [img] : undefined,
    },
  };
}

export default async function HizmetDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const service = SERVICES_DETAIL[slug];
  if (!service) notFound();
  return (
    <>
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
          }),
        )}
      />
      <ServiceDetailClient service={service} />
    </>
  );
}

