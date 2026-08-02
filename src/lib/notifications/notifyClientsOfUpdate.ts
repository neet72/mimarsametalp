import "server-only";

import { render } from "@react-email/render";
import { Resend } from "resend";
import ClientProjectUpdateEmail from "@/emails/ClientProjectUpdateEmail";
import { prisma } from "@/lib/db/prisma";
import { sendSms } from "@/lib/notifications/sendSms";
import { logger } from "@/lib/observability/logger";
import { getSiteUrl } from "@/lib/seo";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

function excerptFromBody(body: string, max = 220) {
  const plain = body
    .replace(/[#>*_`\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

/**
 * Publish sonrası bildirim. Hata olursa publish geri alınmaz; loglanır.
 */
export async function notifyClientsOfUpdate(updateId: string): Promise<void> {
  try {
    const update = await prisma.clientProjectUpdate.findUnique({
      where: { id: updateId },
      include: {
        project: {
          include: {
            members: {
              include: { client: true },
            },
          },
        },
      },
    });

    if (!update || !update.isPublished) return;

    const panelUrl = `${getSiteUrl().replace(/\/$/, "")}/panel/guncellemeler`;
    const excerpt = excerptFromBody(update.body);

    for (const member of update.project.members) {
      const client = member.client;
      if (!client.active) continue;

      if (client.notifyEmail && client.email) {
        let status = "failed";
        let providerResponse: string | undefined;
        try {
          if (!resend) {
            status = process.env.NODE_ENV === "development" ? "skipped" : "failed";
            providerResponse = "RESEND_API_KEY missing";
          } else {
            const html = await render(
              ClientProjectUpdateEmail({
                clientName: client.fullName,
                projectTitle: update.project.title,
                updateTitle: update.title,
                excerpt,
                panelUrl,
              }),
            );
            const { error } = await resend.emails.send({
              from,
              to: [client.email],
              subject: `${update.project.title}: ${update.title}`,
              html,
            });
            if (error) {
              providerResponse = JSON.stringify(error);
              status = "failed";
            } else {
              status = "sent";
            }
          }
        } catch (e) {
          providerResponse = e instanceof Error ? e.message : String(e);
          status = "failed";
        }

        await prisma.clientNotificationLog.create({
          data: {
            clientId: client.id,
            updateId: update.id,
            channel: "email",
            status,
            providerResponse,
          },
        });
      }

      if (client.notifySms && client.phone) {
        const sms = await sendSms({
          to: client.phone,
          body: `${update.project.title}: ${update.title}. Detay: ${panelUrl}`,
        });
        await prisma.clientNotificationLog.create({
          data: {
            clientId: client.id,
            updateId: update.id,
            channel: "sms",
            status: sms.status,
            providerResponse: "providerResponse" in sms ? sms.providerResponse : undefined,
          },
        });
      }
    }
  } catch (e) {
    logger.error({
      msg: "notifyClientsOfUpdate failed",
      scope: "notifications.update",
      updateId,
      error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
    });
  }
}
