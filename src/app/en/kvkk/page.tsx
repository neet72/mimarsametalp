import type { Metadata } from "next";
import { KvkkPageContent } from "@/components/legal/KvkkPageContent";
import {
  KVKK_PAGE_DESCRIPTION,
  KVKK_PAGE_TITLE,
} from "@/content/kvkk-page.en";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = `${KVKK_PAGE_TITLE} | Samet Alp Architecture`;

export const metadata: Metadata = {
  ...pageMetadata({
    title: KVKK_PAGE_TITLE,
    description: KVKK_PAGE_DESCRIPTION,
    path: "/en/kvkk",
  }),
  title: { absolute: pageTitle },
  description: KVKK_PAGE_DESCRIPTION,
  robots: { index: true, follow: true },
};

export default function KvkkPageEn() {
  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Privacy", path: "/en/kvkk" },
          ]),
        )}
      />
      <KvkkPageContent />
    </div>
  );
}
