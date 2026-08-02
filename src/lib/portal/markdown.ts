import { sanitizeHtml } from "@/lib/security/sanitize-html";

function escapeText(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Hafif markdown → HTML (başlık, kalın, italik, link, liste, paragraf).
 * Çıktı her zaman sanitize edilir.
 */
export function renderMarkdownSafe(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const htmlParts: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
  };

  const inline = (text: string) => {
    let t = escapeText(text);
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    return t;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(line.trim());
    if (listMatch) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      htmlParts.push(`<li>${inline(listMatch[1]!)}</li>`);
      continue;
    }

    flushList();

    const h3 = /^###\s+(.+)$/.exec(line.trim());
    if (h3) {
      htmlParts.push(`<h3>${inline(h3[1]!)}</h3>`);
      continue;
    }
    const h2 = /^##\s+(.+)$/.exec(line.trim());
    if (h2) {
      htmlParts.push(`<h2>${inline(h2[1]!)}</h2>`);
      continue;
    }
    const h1 = /^#\s+(.+)$/.exec(line.trim());
    if (h1) {
      htmlParts.push(`<h1>${inline(h1[1]!)}</h1>`);
      continue;
    }

    htmlParts.push(`<p>${inline(line.trim())}</p>`);
  }

  flushList();
  return sanitizeHtml(htmlParts.join("\n"));
}
