import type { Metadata } from "next";
import { HizmetlerimizPageContent } from "@/components/hizmetlerimiz/HizmetlerimizPageContent";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";
import { getServiceListingItems } from "@/lib/public/service-listing";

const pageTitle = "Services | Samet Alp Architecture";
const pageDescription =
  "Architecture, interior design, 3D visualization, and urban planning — based in Adana, Turkey.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Services",
    description: pageDescription,
    path: "/en/hizmetlerimiz",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

export default async function ServicesPageEn() {
  const items = await getServiceListingItems("en");
  return (
    <div className="contents">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Services", path: "/en/hizmetlerimiz" },
          ]),
        )}
      />
      <HizmetlerimizPageContent items={items} locale="en" />
    </div>
  );
}

