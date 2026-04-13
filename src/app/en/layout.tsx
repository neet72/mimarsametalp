import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { MainLayout } from "@/components/layout/MainLayout";
import { metadataBase, siteName } from "@/lib/seo";
import { jsonLdScriptProps, organizationJsonLd, websiteJsonLd } from "@/lib/seo-jsonld";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const defaultDescription =
  "Architectural design, permits, and turnkey delivery for residential, commercial, and interior projects. Samet Alp Architecture portfolio and contact.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

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

export default function EnRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body
        className="font-sans [--font-display:var(--font-outfit)] [--font-sans:var(--font-inter)]"
        suppressHydrationWarning
      >
        <script {...jsonLdScriptProps(organizationJsonLd())} />
        <script {...jsonLdScriptProps(websiteJsonLd({ inLanguage: "en-US", path: "/en" }))} />
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

