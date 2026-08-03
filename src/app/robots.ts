import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

const PRIVATE = ["/api/", "/admin", "/panel"] as const;

/** AI / generative crawlers — public content allow, private paths deny. */
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Anthropic-AI",
  "PerplexityBot",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "meta-externalagent",
] as const;

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE],
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/" as const,
        disallow: [...PRIVATE],
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: new URL(base).host,
  };
}
