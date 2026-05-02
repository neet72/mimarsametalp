import type { Metadata } from "next";
import { ContactPageExperience } from "@/components/contact/ContactPageExperience";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "İletişim | Samet Alp Mimarlık";
const pageDescription =
  "Ofis adresi, harita, telefon ve e-posta ile Samet Alp Mimarlık’a ulaşın; proje görüşmesi için form ile mesaj gönderin. Adana mimarlık ofisi iletişim bilgileri.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "İletişim",
    description: pageDescription,
    path: "/iletisim",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

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
