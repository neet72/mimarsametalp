import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/about/AboutPageExperience";
import { getSiteContent } from "@/actions/admin/site-content";
import { mergeAboutWithPortraitFallback, parseAboutCms } from "@/lib/site-content/about-cms";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "Hakkımızda | Samet Alp Mimarlık";
const pageDescription =
  "Adana’daki mimarlık ofisimiz: müşteri odaklı mimari tasarım, anahtar teslim, danışmanlık ve iç dekorasyon. Ekibimiz ve yaklaşımımızla tanışın.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Hakkımızda",
    description: pageDescription,
    path: "/hakkimizda",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

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
