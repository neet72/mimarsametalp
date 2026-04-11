import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { MainLayout } from "@/components/layout/MainLayout";
import { metadataBase, siteName } from "@/lib/seo";
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

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: defaultDescription,
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
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName,
    title: siteName,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${outfit.variable}`}>
      <body
        className="font-sans [--font-display:var(--font-outfit)] [--font-sans:var(--font-inter)]"
        suppressHydrationWarning
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
