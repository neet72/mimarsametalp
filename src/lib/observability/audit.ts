import "server-only";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/observability/logger";

type AuditInput = {
  actor: string;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
};

/**
 * Admin audit log yaz.
 * Not: DB'de tablo henüz migrate edilmediyse hata yutulur (prod'u kırmamak için).
 */
export async function auditAdmin(input: AuditInput) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actor: input.actor,
        action: input.action,
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  } catch {
    logger.warn({
      scope: "audit",
      msg: "AdminAuditLog yazılamadı (muhtemelen migrate eksik).",
      action: input.action,
      actor: input.actor,
    });
    // intentionally swallow
  }
}

