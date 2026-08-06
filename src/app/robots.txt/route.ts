import { getSiteUrl } from "@/lib/seo";

export const revalidate = 86400;

/**
 * Tam robots.txt (Resemble / GeoDaddy tarzı).
 * MetadataRoute.Robots Content-Signal ve yorum satırlarını desteklemediği için
 * düz metin route kullanıyoruz.
 */
export function GET() {
  const base = getSiteUrl();
  const host = new URL(base).host;
  const privatePaths = ["/api/", "/admin", "/panel"];

  const disallowPrivate = privatePaths.map((p) => `Disallow: ${p}`).join("\n");

  const allowPublic = (agents: string[]) =>
    agents
      .map(
        (ua) =>
          `User-agent: ${ua}\nAllow: /\n${disallowPrivate}\n`,
      )
      .join("\n");

  const blockAll = (agents: string[]) =>
    agents.map((ua) => `User-agent: ${ua}\nDisallow: /\n`).join("\n");

  const body = `# robots.txt for ${host}
# Samet Alp Mimarlık — Adana mimarlık ofisi
#
# Meşru arama motorları ve AI asistan crawler'ları memnuniyetle karşılanır.
# llms.txt: ${base}/llms.txt
# Sitemap: ${base}/sitemap.xml
#
# Content-Signal (EU DSM Directive Art. 4 rezervasyonu ile uyumlu niyet):
#   search=yes   — arama indeksi / sonuç özetleri
#   ai-input=yes — RAG, grounding, anlık AI yanıtları için alıntı
#   ai-train=no  — model eğitimi / fine-tune için toplama yok

# -----------------------------------------------------------------------------
# Traditional search engines
# -----------------------------------------------------------------------------

${allowPublic(["Googlebot", "Bingbot", "DuckDuckBot", "Applebot", "Yandex"])}

# -----------------------------------------------------------------------------
# OpenAI / ChatGPT
# -----------------------------------------------------------------------------

${allowPublic(["GPTBot", "OAI-SearchBot", "ChatGPT-User"])}

# -----------------------------------------------------------------------------
# Google AI / Gemini (Google-Extended: AI Overviews / Gemini; Search ranking ayrı)
# -----------------------------------------------------------------------------

${allowPublic([
  "Google-Extended",
  "GoogleOther",
  "Google-CloudVertexBot",
  "Google-NotebookLM",
  "Gemini-Deep-Research",
])}

# -----------------------------------------------------------------------------
# Anthropic / Claude
# -----------------------------------------------------------------------------

${allowPublic([
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "claude-web",
  "anthropic-ai",
])}

# -----------------------------------------------------------------------------
# Perplexity
# -----------------------------------------------------------------------------

${allowPublic(["PerplexityBot", "Perplexity-User"])}

# -----------------------------------------------------------------------------
# Apple Intelligence (Applebot-Extended = training; Applebot = search yukarıda)
# -----------------------------------------------------------------------------

${allowPublic(["Applebot-Extended"])}

# -----------------------------------------------------------------------------
# Other AI assistants
# -----------------------------------------------------------------------------

${allowPublic([
  "Meta-ExternalAgent",
  "meta-externalagent",
  "FacebookBot",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
  "cohere-ai",
  "CCBot",
])}

# -----------------------------------------------------------------------------
# Blocked: abusive / bandwidth-heavy commercial scrapers
# -----------------------------------------------------------------------------

${blockAll([
  "Bytespider",
  "Diffbot",
  "Omgili",
  "Omgilibot",
  "img2dataset",
  "Scrapy",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
])}

# -----------------------------------------------------------------------------
# Default
# -----------------------------------------------------------------------------

User-agent: *
Content-Signal: search=yes,ai-input=yes,ai-train=no
Allow: /
${disallowPrivate}

# -----------------------------------------------------------------------------
# Sitemaps & host
# -----------------------------------------------------------------------------

Host: ${host}
Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
