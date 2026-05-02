import type { Metadata } from "next";
import { HizmetlerimizPageContent } from "@/components/hizmetlerimiz/HizmetlerimizPageContent";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "Hizmetlerimiz | Samet Alp Mimarlık";
const pageDescription =
  "Adana merkezli mimari tasarım, iç mimarlık, 3D görselleştirme ve kentsel planlama hizmetlerimiz.";

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

export default function HizmetlerimizPage() {
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hizmetlerimiz", path: "/hizmetlerimiz" },
          ]),
        )}
      />
      <HizmetlerimizPageContent />
    </>
  );
}
