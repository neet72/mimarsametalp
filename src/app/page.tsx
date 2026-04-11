import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ServicesSection } from "@/components/home/ServicesSection";
import { VisionIntro } from "@/components/home/VisionIntro";
import { SocialGallery } from "@/components/home/SocialGallery";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ana Sayfa",
  description:
    "Samet Alp Mimarlık: mimarlık, iç mimarlık ve anahtar teslim projelerde çağdaş ve sürdürülebilir tasarım.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <VisionIntro />
      <ServicesSection />
      <AboutSection />
      <SocialGallery />
    </>
  );
}
