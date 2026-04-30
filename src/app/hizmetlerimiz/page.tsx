import type { Metadata } from "next";
import { HizmetlerimizPageContent } from "@/components/hizmetlerimiz/HizmetlerimizPageContent";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Hizmetlerimiz",
  description:
    "İç mimarlık, anahtar teslim proje, mimari kontrolörlük, tasarım ve ruhsat, danışmanlık ile yenileme ve tadilat hizmetleri.",
  path: "/hizmetlerimiz",
});

export default function HizmetlerimizPage() {
  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hizmetlerimiz", path: "/hizmetlerimiz" },
          ]),
        )}
      />
      <HizmetlerimizPageContent />
    </>
  );
}
