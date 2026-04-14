import type { Metadata } from "next";
import { metadataBase, siteName } from "@/lib/seo";

const defaultDescription =
  "Architectural design, permits, and turnkey delivery for residential, commercial, and interior projects. Samet Alp Architecture portfolio and contact.";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteName} (EN)`,
    template: `%s · ${siteName}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/en",
    languages: {
      "tr-TR": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/en",
    siteName,
    title: siteName,
    description: defaultDescription,
    images: [{ url: "/en/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: ["/en/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

