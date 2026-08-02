import "server-only";

import { Resend } from "resend";
import { logger } from "@/lib/observability/logger";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const adminInbox = process.env.CONTACT_INBOX_EMAIL ?? "info@mimarsametalp.com";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendClientTempPasswordEmail(input: {
  to: string;
  fullName: string;
  username: string;
  tempPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      logger.warn({
        msg: "RESEND_API_KEY yok; temp password e-postası atlandı (dev).",
        scope: "email.client-password",
        username: input.username,
      });
      return { ok: true };
    }
    return { ok: false, error: "E-posta sunucusu yapılandırılmamış." };
  }

  const html = `
    <h1>Samet Alp Mimarlık — Müşteri paneli</h1>
    <p>Merhaba ${escapeHtml(input.fullName)},</p>
    <p>Kullanıcı adınız: <strong>${escapeHtml(input.username)}</strong></p>
    <p>Şifreniz: <strong>${escapeHtml(input.tempPassword)}</strong></p>
    <p>Panele giriş: kullanıcı adınız ve bu şifre ile.</p>
  `;

  const { error } = await resend.emails.send({
    from,
    to: [input.to],
    subject: "Müşteri paneli giriş bilgileriniz",
    html,
  });

  if (error) {
    logger.error({ msg: "temp password email failed", scope: "email.client-password", error });
    return { ok: false, error: "E-posta gönderilemedi." };
  }
  return { ok: true };
}

export async function sendDeliveryRequestAdminEmail(input: {
  projectTitle: string;
  fullName: string;
  phone: string;
  subject: string;
  address?: string | null;
  notes?: string | null;
}): Promise<void> {
  if (!resend) {
    logger.warn({ msg: "delivery email skipped", scope: "email.delivery" });
    return;
  }

  const html = `
    <h1>Yeni müşteri isteği</h1>
    <p><strong>Proje:</strong> ${escapeHtml(input.projectTitle)}</p>
    <p><strong>Konu:</strong> ${escapeHtml(input.subject)}</p>
    <p><strong>Ad:</strong> ${escapeHtml(input.fullName)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(input.phone)}</p>
    ${input.address ? `<p><strong>Adres:</strong> ${escapeHtml(input.address)}</p>` : ""}
    ${input.notes ? `<p><strong>Mesaj:</strong> ${escapeHtml(input.notes)}</p>` : ""}
  `;

  const { error } = await resend.emails.send({
    from,
    to: [adminInbox],
    subject: `İstek: ${input.subject} — ${input.projectTitle}`,
    html,
  });

  if (error) {
    logger.error({ msg: "delivery admin email failed", scope: "email.delivery", error });
  }
}
