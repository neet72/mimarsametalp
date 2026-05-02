import type { Metadata } from "next";
import { ContactPageExperience } from "@/components/contact/ContactPageExperience";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "Contact | Samet Alp Architecture";
const pageDescription =
  "Office location, Google Maps, phone & email — start a consultation or reach our Adana studio. Send a secure message via the contact form.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Contact",
    description: pageDescription,
    path: "/en/iletisim",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

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

