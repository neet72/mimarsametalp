import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";
import { CinematicScrollHero } from "@/components/home/CinematicScrollHero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { VisionIntro } from "@/components/home/VisionIntro";
import { SocialGallery } from "@/components/home/SocialGallery";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = `Samet Alp Architecture | Home`;
const pageDescription =
  "Samet Alp Architecture — Adana: architecture, interior design, 3D visualization, urban planning, and turnkey delivery.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Home",
    description: pageDescription,
    path: "/en",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

export default function HomePageEn() {
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
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

