import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/about/AboutPageExperience";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Hakkımızda",
  description:
    "Mimarlık hizmetlerimizi müşteri odaklı yaklaşımla şekillendiriyoruz; anahtar teslim, danışmanlık ve iç dekorasyonda profesyonel çözümler.",
  path: "/hakkimizda",
});

export default function HakkimizdaPage() {
  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hakkımızda", path: "/hakkimizda" },
          ]),
        )}
      />
      <AboutPageExperience />
    </>
  );
}
