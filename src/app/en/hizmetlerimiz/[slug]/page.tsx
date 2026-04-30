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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES_DETAIL[slug];
  if (!service) {
    return pageMetadata({
      title: "Service Detail",
      description: "Service detail.",
      path: "/en/hizmetlerimiz",
    });
  }

  const title = service.name;
  const description = service.shortDescription.slice(0, 180);
  // Prefer DB-backed cached hero image (Cloudinary), fallback to in-code content image.
  const key = String(slug ?? "").trim().toLowerCase();
  const db = key ? await getPublicServiceBySlug(key) : null;
  const img = db?.heroImageUrl ?? service.heroImageUrl;

  return {
    ...pageMetadata({
      title,
      description,
      path: `/en/hizmetlerimiz/${service.slug}`,
    }),
    openGraph: {
      type: "website",
      locale: "en_US",
      title: `${title} | Samet Alp Architecture`,
      description,
      url: `/en/hizmetlerimiz/${service.slug}`,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Samet Alp Architecture`,
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
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Services", path: "/en/hizmetlerimiz" },
            { name: service.name, path: `/en/hizmetlerimiz/${service.slug}` },
          ]),
        )}
      />
      <script
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

