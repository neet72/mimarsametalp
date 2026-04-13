import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/about/AboutPageExperience";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "We shape architecture with a client-first approach—turnkey delivery, consulting, and interior design solutions.",
  path: "/en/hakkimizda",
});

export default function AboutPageEn() {
  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "About", path: "/en/hakkimizda" },
          ]),
        )}
      />
      <AboutPageExperience />
    </>
  );
}

