"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { sendContactNotification } from "@/lib/email/send-contact-notification";
import { checkContactRateLimit } from "@/lib/rate-limit/contact";
import { contactFormSchema, flattenContactErrors } from "@/lib/validations/contact";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip, "utf8").digest("hex").slice(0, 48);
}

function clientIpFromHeaders(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

export type ContactSubmitResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: ReturnType<typeof flattenContactErrors> };

export async function submitContactForm(data: unknown): Promise<ContactSubmitResult> {
  const h = await headers();
  const ip = clientIpFromHeaders(h);

  if (ip !== "unknown") {
    const rl = checkContactRateLimit(ip);
    if (!rl.ok) {
      return {
        ok: false,
        error: `Çok fazla istek. Lütfen ${rl.retryAfterSec} saniye sonra tekrar deneyin.`,
      };
    }
  }

  const parsed = contactFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Lütfen formu kontrol edin.",
      fieldErrors: flattenContactErrors(parsed.error),
    };
  }

  const emailResult = await sendContactNotification({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error };
  }

  try {
    await prisma.message.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        body: parsed.data.message,
        ipHash: ip !== "unknown" ? hashIp(ip) : null,
      },
    });
  } catch (e) {
    console.warn("[contact] Message DB yazılamadı:", e);
  }

  return { ok: true, message: "Mesajınız alındı. En kısa sürede size dönüş yapacağız." };
}
