import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { headers } from "next/headers";
import { MainLayout } from "@/components/layout/MainLayout";
import { metadataBase, siteName } from "@/lib/seo";
import { jsonLdScriptProps, localBusinessJsonLd, organizationJsonLd, siteNavigationJsonLd, websiteJsonLd } from "@/lib/seo-jsonld";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

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
  "Konut, ticari ve iç mimarlık projelerinde mimari tasarım, ruhsat ve anahtar teslim uygulama. Adana merkezli Samet Alp Mimarlık portföyü ve iletişim.";

/** Mobil tarayıcılar, notch ve PWA çubuğu için */
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
    default: "Samet Alp Mimarlık | Lüks ve Fonksiyonel Tasarım",
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "mimarlık",
    "iç mimarlık",
    "anahtar teslim proje",
    "mimari tasarım",
    "ruhsat",
    "tadilat",
    "Adana mimarlık ofisi",
    "Samet Alp Mimarlık",
  ],
  applicationName: siteName,
  authors: [{ name: siteName, url: metadataBase.toString() }],
  creator: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName,
    title: "Samet Alp Mimarlık | Lüks ve Fonksiyonel Tasarım",
    description: defaultDescription,
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const locale = (h.get("x-locale") ?? "") === "en" ? "en" : "tr";
  const pathname = h.get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");
  return (
    <html
      lang={locale === "en" ? "en" : "tr"}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${outfit.variable}`}
    >
      <body
        className="font-sans [--font-display:var(--font-outfit)] [--font-sans:var(--font-inter)]"
        suppressHydrationWarning
      >
        <script key="jsonld-org" {...jsonLdScriptProps(organizationJsonLd())} />
        <script key="jsonld-local" {...jsonLdScriptProps(localBusinessJsonLd())} />
        <script
          key="jsonld-website"
          {...jsonLdScriptProps(
            websiteJsonLd({
              inLanguage: locale === "en" ? "en-US" : "tr-TR",
              path: locale === "en" ? "/en" : "/",
            }),
          )}
        />
        <script
          key="jsonld-nav"
          {...jsonLdScriptProps(
            siteNavigationJsonLd({
              inLanguage: locale === "en" ? "en-US" : "tr-TR",
              pathPrefix: locale === "en" ? "/en" : "",
            }),
          )}
        />
        <MainLayout key="main-layout" locale={locale}>
          {children}
        </MainLayout>
        {/* Avoid dev key warnings inside analytics overlay on admin routes */}
        {isAdmin ? null : <Analytics key="analytics" />}
      </body>
    </html>
  );
}
