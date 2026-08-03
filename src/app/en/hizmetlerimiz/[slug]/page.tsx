import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/hizmetlerimiz/ServiceDetailClient";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd, jsonLdScriptProps, serviceJsonLd } from "@/lib/seo-jsonld";
import { getPublicServiceBySlug } from "@/lib/public/services";
import { resolveServiceDetailData } from "@/lib/public/resolve-service-detail";
import { getServiceListingItems } from "@/lib/public/service-listing";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const enBrand = "Samet Alp Architecture";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const key = String(slug ?? "").trim().toLowerCase();
  const db = key ? await getPublicServiceBySlug(key) : null;
  const resolved = resolveServiceDetailData(key, "en", db);
  if (!resolved) {
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

  const title = resolved.name;
  const rawDesc = String(resolved.shortDescription ?? "").trim();
  const description = (rawDesc || `${resolved.name} — ${enBrand}, Adana.`).slice(0, 200);
  const absoluteTitle = `${title} | ${enBrand}`;
  const img = resolved.heroImageUrl;

  return {
    ...pageMetadata({
      title,
      description,
      path: `/en/hizmetlerimiz/${resolved.slug}`,
    }),
    title: { absolute: absoluteTitle },
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      title: absoluteTitle,
      description,
      url: `/en/hizmetlerimiz/${resolved.slug}`,
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
  const key = String(slug ?? "").trim().toLowerCase();
  const db = key ? await getPublicServiceBySlug(key) : null;
  const service = resolveServiceDetailData(key, "en", db);
  if (!service) notFound();

  const listing = await getServiceListingItems("en");
  const relatedServices = listing
    .filter((s) => s.slug !== service.slug)
    .slice(0, 6)
    .map((s) => ({ title: s.title, href: `/en/hizmetlerimiz/${s.slug}` }));

  return (
    <div className="w-full">
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
            inLanguage: "en-US",
            dateModified: db?.updatedAt ?? null,
            serviceType: service.name,
          }),
        )}
      />
      {(() => {
        const faq = faqPageJsonLd({
          path: `/en/hizmetlerimiz/${service.slug}`,
          inLanguage: "en-US",
          items: service.sss.map((x) => ({ question: x.question, answer: x.answer })),
        });
        return faq ? <script key="jsonld-faq" {...jsonLdScriptProps(faq)} /> : null;
      })()}
      <ServiceDetailClient service={service} relatedServices={relatedServices} />
    </div>
  );
}

