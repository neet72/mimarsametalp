import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Güvenlik: CSP ve çoğu başlık `src/middleware.ts` içinde tek kaynak olarak ayarlanıyor.
 * Burada yalnızca middleware’de olmayanı ekliyoruz; aksi halde iki farklı CSP/XFO
 * birlikte gönderilir ve Lighthouse “Content security policy” uyarıları üretebilir.
 */
const extraSecurityHeaders = [{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mpm.ph",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...extraSecurityHeaders],
      },
    ];
  },
};

export default nextConfig;
