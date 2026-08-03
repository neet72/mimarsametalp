import type { Metadata } from "next";
import { HizmetlerimizPageContent } from "@/components/hizmetlerimiz/HizmetlerimizPageContent";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";
import { getServiceListingItems } from "@/lib/public/service-listing";

const pageTitle = "Hizmetlerimiz | Samet Alp Mimarlık";
const pageDescription =
  "Adana merkezli mimari tasarım, ruhsat projesi, iç mimarlık, anahtar teslim ve danışmanlık hizmetlerimiz.";

/** absolute: kök layout title şablonuna çift ekleme yapmaması için */
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Hizmetlerimiz",
    description: pageDescription,
    path: "/hizmetlerimiz",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

export default async function HizmetlerimizPage() {
  const items = await getServiceListingItems("tr");
  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hizmetlerimiz", path: "/hizmetlerimiz" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          itemListJsonLd({
            name: "Hizmetlerimiz",
            path: "/hizmetlerimiz",
            inLanguage: "tr-TR",
            items: items.map((s) => ({
              name: s.title,
              path: `/hizmetlerimiz/${s.slug}`,
              imageUrl: s.imageUrl,
              itemType: "Service",
            })),
          }),
        )}
      />
      <HizmetlerimizPageContent items={items} locale="tr" />
    </div>
  );
}
