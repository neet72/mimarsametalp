import "server-only";

import { logger } from "@/lib/observability/logger";

export type SendSmsResult =
  | { ok: true; status: "sent"; providerResponse?: string }
  | { ok: true; status: "skipped"; providerResponse: string }
  | { ok: false; status: "failed"; providerResponse: string };

/**
 * SMS stub — NetGSM (veya başka sağlayıcı) hazır olunca yalnızca bu dosya doldurulur.
 * Env boşken her zaman skipped döner; publish akışını engellemez.
 */
export async function sendSms(input: {
  to: string;
  body: string;
}): Promise<SendSmsResult> {
  const provider = process.env.SMS_PROVIDER?.trim();
  if (!provider) {
    logger.info({
      msg: "SMS skipped (SMS_PROVIDER unset)",
      scope: "notifications.sms",
      toLen: input.to.length,
    });
    return {
      ok: true,
      status: "skipped",
      providerResponse: "SMS_PROVIDER not configured",
    };
  }

  // Placeholder for future NetGSM integration.
  logger.warn({
    msg: "SMS provider set but sendSms not implemented yet",
    scope: "notifications.sms",
    provider,
  });
  return {
    ok: true,
    status: "skipped",
    providerResponse: `Provider "${provider}" not implemented`,
  };
}
