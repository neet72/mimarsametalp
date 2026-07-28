import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider, THEME_BOOT_SCRIPT } from "@/components/theme/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { metadataBase, siteName } from "@/lib/seo";
import { jsonLdScriptProps, localBusinessJsonLd, organizationJsonLd, siteNavigationJsonLd, websiteJsonLd } from "@/lib/seo-jsonld";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  "Modern mimari tasarımlar, 3D görselleştirme ve kentsel planlama projeleri üreten profesyonel mimarlık ofisi. Samet Alp Mimarlık — Adana.";

/** Mobil tarayıcılar, notch ve PWA çubuğu için */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1815" },
  ],
};

export const metadata: Metadata = {
  metadataBase,
  /** PWA / tarayıcı ikonları — dosyalar `public/` kökünde olmalı (RealFaviconGenerator çıktısı). */
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Mimar Samet Alp",
    capable: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {/* Instrument Serif — App Router `head.tsx` kullanılmaz; CSP ile Google Fonts açık */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Instrument Serif next/font'ta yok */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
      </head>
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
        <ThemeProvider>
          <MainLayout key="main-layout">{children}</MainLayout>
          {isAdmin ? null : <Analytics key="analytics" />}
          {isAdmin ? null : <SpeedInsights key="speed-insights" />}
        </ThemeProvider>
      </body>
    </html>
  );
}
