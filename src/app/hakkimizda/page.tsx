import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/about/AboutPageExperience";
import { getSiteContent } from "@/actions/admin/site-content";
import { mergeAboutWithPortraitFallback, parseAboutCms } from "@/lib/site-content/about-cms";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Hakkımızda",
  description:
    "Mimarlık hizmetlerimizi müşteri odaklı yaklaşımla şekillendiriyoruz; anahtar teslim, danışmanlık ve iç dekorasyonda profesyonel çözümler.",
  path: "/hakkimizda",
});

export default async function HakkimizdaPage() {
  const [rawTr, rawEn] = await Promise.all([getSiteContent("about", "tr"), getSiteContent("about", "en")]);
  const aboutCms = mergeAboutWithPortraitFallback(parseAboutCms(rawTr), parseAboutCms(rawEn));

  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hakkımızda", path: "/hakkimizda" },
          ]),
        )}
      />
      <AboutPageExperience aboutCms={aboutCms} />
    </>
  );
}
