import type { Metadata } from "next";
import { ContactPageExperience } from "@/components/contact/ContactPageExperience";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "İletişim",
  description:
    "Samet Alp Mimarlık ile ilk danışma, proje taslağı ve yer ziyareti adımlarında yanınızdayız. E-posta ve telefon üzerinden bize ulaşın.",
  path: "/iletisim",
});

export default function IletisimPage() {
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "İletişim", path: "/iletisim" },
          ]),
        )}
      />
      <ContactPageExperience />
    </>
  );
}
