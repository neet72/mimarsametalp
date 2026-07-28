import type { Metadata } from "next";
import { KvkkPageContent } from "@/components/legal/KvkkPageContent";
import { KVKK_PAGE_DESCRIPTION, KVKK_PAGE_TITLE } from "@/content/kvkk-page";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = `${KVKK_PAGE_TITLE} | Samet Alp Mimarlık`;

export const metadata: Metadata = {
  ...pageMetadata({
    title: KVKK_PAGE_TITLE,
    description: KVKK_PAGE_DESCRIPTION,
    path: "/kvkk",
  }),
  title: { absolute: pageTitle },
  description: KVKK_PAGE_DESCRIPTION,
  robots: { index: true, follow: true },
};

export default function KvkkPage() {
  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "KVKK", path: "/kvkk" },
          ]),
        )}
      />
      <KvkkPageContent />
    </div>
  );
}
