import "server-only";

import { render } from "@react-email/render";
import { Resend } from "resend";
import ContactFormEmail from "@/emails/ContactFormEmail";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const to = process.env.CONTACT_INBOX_EMAIL ?? "info@mimarsametalp.com";

export async function sendContactNotification(input: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[email] RESEND_API_KEY tanımlı değil; geliştirme modunda e-posta atlanıyor.",
      );
      return { ok: true };
    }
    return { ok: false, error: "E-posta sunucusu yapılandırılmamış." };
  }

  const submittedAtIso = new Date().toISOString();

  const html = await render(
    ContactFormEmail({
      ...input,
      submittedAtIso,
    }),
  );

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: input.email,
    subject: `İletişim: ${input.firstName} ${input.lastName}`,
    html,
    headers: {
      "X-Entity-Ref-ID": `contact-${submittedAtIso}`,
    },
  });

  if (error) {
    console.error("[email] Resend:", error);
    return { ok: false, error: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[email] Gönderildi:", data?.id);
  }

  return { ok: true };
}
