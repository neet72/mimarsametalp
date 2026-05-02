import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/about/AboutPageExperience";
import { getSiteContent } from "@/actions/admin/site-content";
import { mergeAboutWithPortraitFallback, parseAboutCms } from "@/lib/site-content/about-cms";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "About | Samet Alp Architecture";
const pageDescription =
  "Meet our Adana architecture studio — client‑first turnkey delivery, consulting, interiors, and a modern approach to every project.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "About",
    description: pageDescription,
    path: "/en/hakkimizda",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

export default async function AboutPageEn() {
  const [rawEn, rawTr] = await Promise.all([getSiteContent("about", "en"), getSiteContent("about", "tr")]);
  const aboutCms = mergeAboutWithPortraitFallback(parseAboutCms(rawEn), parseAboutCms(rawTr));

  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "About", path: "/en/hakkimizda" },
          ]),
        )}
      />
      <AboutPageExperience aboutCms={aboutCms} />
    </>
  );
}

