import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";
import { CinematicScrollHero } from "@/components/home/CinematicScrollHero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { VisionIntro } from "@/components/home/VisionIntro";
import { SocialGallery } from "@/components/home/SocialGallery";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description:
    "Samet Alp Architecture: contemporary, sustainable design across architecture, interior architecture, and turnkey projects.",
  path: "/en",
});

export default function HomePageEn() {
  return (
    <>
      <CinematicScrollHero />
      <div id="home-content-start" />
      <VisionIntro />
      <ServicesSection />
      <AboutSection />
      <SocialGallery />
    </>
  );
}

