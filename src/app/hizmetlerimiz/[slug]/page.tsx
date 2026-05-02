import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/hizmetlerimiz/ServiceDetailClient";
import { pageMetadata, siteName } from "@/lib/seo";
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

  const title = service.name;
  const rawDesc = String(service.shortDescription ?? "").trim();
  const description = (rawDesc || `${service.name} — ${siteName}, Adana.`).slice(0, 200);
  const absoluteTitle = `${title} | ${siteName}`;
  const img = service.heroImageUrl;

  return {
    ...pageMetadata({
      title,
      description,
      path: `/hizmetlerimiz/${service.slug}`,
    }),
    title: { absolute: absoluteTitle },
    description,
    openGraph: {
      type: "website",
      locale: "tr_TR",
      title: absoluteTitle,
      description,
      url: `/hizmetlerimiz/${service.slug}`,
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
  const service = SERVICES_DETAIL[slug];
  if (!service) notFound();
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hizmetlerimiz", path: "/hizmetlerimiz" },
            { name: service.name, path: `/hizmetlerimiz/${service.slug}` },
          ]),
        )}
      />
      <script
        key="jsonld-service"
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

