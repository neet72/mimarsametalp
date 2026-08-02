"use server";

import { z } from "zod";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { notifyClientsOfUpdate } from "@/lib/notifications/notifyClientsOfUpdate";
import { logger } from "@/lib/observability/logger";
import {
  isPortalAllowedMime,
  MAX_PORTAL_MEDIA_BYTES,
  portalMediaKindFromMime,
} from "@/lib/portal/media-types";

export const createClientProjectUpdate = createSafeAction({
  scope: "admin.client-update.create",
  schema: z.object({
    projectId: z.string().min(1),
    stageId: z.string().min(1).optional().nullable(),
    title: z.string().trim().min(2).max(200),
    body: z.string().trim().min(1).max(50_000),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const update = await prisma.clientProjectUpdate.create({
      data: {
        projectId: input.projectId,
        stageId: input.stageId || null,
        title: input.title,
        body: input.body,
        isPublished: false,
      },
    });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-update.create",
      entity: "ClientProjectUpdate",
      entityId: update.id,
    });
    return { id: update.id };
  },
});

export const updateClientProjectUpdate = createSafeAction({
  scope: "admin.client-update.update",
  schema: z.object({
    id: z.string().min(1),
    stageId: z.string().min(1).optional().nullable(),
    title: z.string().trim().min(2).max(200),
    body: z.string().trim().min(1).max(50_000),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    await prisma.clientProjectUpdate.update({
      where: { id: input.id },
      data: {
        stageId: input.stageId || null,
        title: input.title,
        body: input.body,
      },
    });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-update.update",
      entity: "ClientProjectUpdate",
      entityId: input.id,
    });
    return { id: input.id };
  },
});

export const publishClientProjectUpdate = createSafeAction({
  scope: "admin.client-update.publish",
  schema: z.object({ id: z.string().min(1) }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    const updated = await prisma.clientProjectUpdate.update({
      where: { id: input.id },
      data: { isPublished: true, publishedAt: new Date() },
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-update.publish",
      entity: "ClientProjectUpdate",
      entityId: updated.id,
    });

    // Publish asla notification hatasıyla rollback olmaz
    void notifyClientsOfUpdate(updated.id).catch((e) => {
      logger.error({
        msg: "notify after publish failed",
        scope: "admin.client-update.publish",
        error: e instanceof Error ? e.message : String(e),
      });
    });

    return { id: updated.id };
  },
});

export const unpublishClientProjectUpdate = createSafeAction({
  scope: "admin.client-update.unpublish",
  schema: z.object({ id: z.string().min(1) }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    await prisma.clientProjectUpdate.update({
      where: { id: input.id },
      data: { isPublished: false },
    });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-update.unpublish",
      entity: "ClientProjectUpdate",
      entityId: input.id,
    });
    return { id: input.id };
  },
});

export const uploadClientUpdateMedia = createSafeAction({
  scope: "admin.client-update.media",
  schema: z.object({
    updateId: z.string().min(1),
    file: z.instanceof(File),
    caption: z.string().trim().max(200).optional().or(z.literal("")),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const update = await prisma.clientProjectUpdate.findUnique({
      where: { id: input.updateId },
      select: { id: true },
    });
    if (!update) throw new ActionError("Güncelleme bulunamadı.");

    const type = input.file.type || "application/octet-stream";
    // Bazı tarayıcılar Office MIME’ı boş bırakır — uzantıdan tamamla.
    const name = input.file.name.toLowerCase();
    const inferredType =
      type && type !== "application/octet-stream"
        ? type
        : name.endsWith(".pdf")
          ? "application/pdf"
          : name.endsWith(".doc")
            ? "application/msword"
            : name.endsWith(".docx")
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : name.endsWith(".xls")
                ? "application/vnd.ms-excel"
                : name.endsWith(".xlsx")
                  ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  : name.endsWith(".ppt")
                    ? "application/vnd.ms-powerpoint"
                    : name.endsWith(".pptx")
                      ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      : name.endsWith(".txt")
                        ? "text/plain"
                        : type;

    if (!isPortalAllowedMime(inferredType)) {
      throw new ActionError("Desteklenmeyen dosya. Görsel, video, PDF, Word, Excel veya metin kullanın.");
    }
    if (input.file.size > MAX_PORTAL_MEDIA_BYTES) {
      throw new ActionError("Dosya çok büyük (max 50MB).");
    }

    const bytes = Buffer.from(await input.file.arrayBuffer());
    const uploaded = await uploadToCloudinary({
      buffer: bytes,
      mimeType: inferredType,
      actor: ctx.actor,
      folderKind: "portal",
    });

    const mediaType = portalMediaKindFromMime(inferredType);

    const maxOrder = await prisma.clientUpdateMedia.aggregate({
      where: { updateId: input.updateId },
      _max: { orderIndex: true },
    });

    const caption =
      input.caption?.trim() ||
      (mediaType === "image" || mediaType === "video" ? null : input.file.name.slice(0, 200));

    const media = await prisma.clientUpdateMedia.create({
      data: {
        updateId: input.updateId,
        cloudinaryUrl: uploaded.secureUrl,
        cloudinaryPublicId: uploaded.publicId,
        mediaType,
        caption,
        orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
      },
    });

    return {
      id: media.id,
      url: media.cloudinaryUrl,
      mediaType: media.mediaType,
      caption: media.caption,
      thumbnailUrl: uploaded.thumbnailUrl,
    };
  },
});

export const deleteClientUpdateMedia = createSafeAction({
  scope: "admin.client-update.media.delete",
  schema: z.object({ id: z.string().min(1) }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input) => {
    await prisma.clientUpdateMedia.delete({ where: { id: input.id } });
    return { id: input.id };
  },
});
