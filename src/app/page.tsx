import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";
import { HeroCinematicLite } from "@/components/home/HeroCinematicLite";
import { ServicesSection } from "@/components/home/ServicesSection";
import { VisionIntro } from "@/components/home/VisionIntro";
import { SocialGallery } from "@/components/home/SocialGallery";
import { getServiceListingItems } from "@/lib/public/service-listing";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "Samet Alp Mimarlık | Ana Sayfa";
const pageDescription =
  "Adana merkezli mimarlık ofisi Samet Alp Mimarlık: mimari tasarım, iç mimarlık, 3D görselleştirme, kentsel planlama ve anahtar teslim projeler.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Ana Sayfa",
    description: pageDescription,
    path: "/",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

export default async function HomePage() {
  const serviceItems = await getServiceListingItems("tr");
  const featuredServices = serviceItems.slice(0, 6);
  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          itemListJsonLd({
            name: "Öne çıkan hizmetler",
            path: "/",
            inLanguage: "tr-TR",
            items: featuredServices.map((s) => ({
              name: s.title,
              path: `/hizmetlerimiz/${s.slug}`,
              imageUrl: s.imageUrl,
            })),
          }),
        )}
      />
      <HeroCinematicLite />
      <div id="home-content-start" aria-hidden className="h-px w-full" />
      <VisionIntro />
      <ServicesSection serviceItems={serviceItems} />
      <AboutSection />
      <SocialGallery />
    </div>
  );
}
