import type { Metadata } from "next";
import { HizmetlerimizPageContent } from "@/components/hizmetlerimiz/HizmetlerimizPageContent";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Interior architecture, turnkey projects, architectural supervision, design & permits, consulting, and renovation services.",
  path: "/en/hizmetlerimiz",
});

export default function ServicesPageEn() {
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Services", path: "/en/hizmetlerimiz" },
          ]),
        )}
      />
      <HizmetlerimizPageContent />
    </>
  );
}

