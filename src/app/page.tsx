import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";
import { CinematicScrollHero } from "@/components/home/CinematicScrollHero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { VisionIntro } from "@/components/home/VisionIntro";
import { SocialGallery } from "@/components/home/SocialGallery";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Ana Sayfa",
  description:
    "Samet Alp Mimarlık: mimarlık, iç mimarlık ve anahtar teslim projelerde çağdaş ve sürdürülebilir tasarım.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
          ]),
        )}
      />
      <CinematicScrollHero />
      <div id="home-content-start" aria-hidden className="h-px w-full" />
      <VisionIntro />
      <ServicesSection />
      <AboutSection />
      <SocialGallery />
    </>
  );
}
