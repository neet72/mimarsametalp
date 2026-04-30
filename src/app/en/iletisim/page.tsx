import type { Metadata } from "next";
import { ContactPageExperience } from "@/components/contact/ContactPageExperience";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Reach Samet Alp Architecture. We guide you through consultation, project brief, and site visit steps.",
  path: "/en/iletisim",
});

export default function ContactPageEn() {
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Contact", path: "/en/iletisim" },
          ]),
        )}
      />
      <ContactPageExperience />
    </>
  );
}

