"use server";

import { z } from "zod";
import { ClientAttachmentKind } from "@prisma/client";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction, ActionError } from "@/lib/actions/safe-action";
import { prisma } from "@/lib/db/prisma";
import { auditAdmin } from "@/lib/observability/audit";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import {
  isPortalAllowedMime,
  isPortalRarFile,
  MAX_PORTAL_MEDIA_BYTES,
} from "@/lib/portal/media-types";

const httpUrl = z
  .string()
  .trim()
  .url("Geçerli bir URL girin")
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
    message: "Link http(s) ile başlamalı",
  });

function resolveUploadMime(file: File): string {
  const type = file.type || "application/octet-stream";
  const name = file.name.toLowerCase();
  if (type && type !== "application/octet-stream") return type;
  if (name.endsWith(".rar")) return "application/vnd.rar";
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".doc")) return "application/msword";
  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (name.endsWith(".xls")) return "application/vnd.ms-excel";
  if (name.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (name.endsWith(".zip")) return "application/zip";
  return type;
}

export const createClientProjectAttachmentLink = createSafeAction({
  scope: "admin.client-attachment.link",
  schema: z.object({
    projectId: z.string().min(1),
    name: z.string().trim().min(1, "İsim gerekli").max(200),
    url: httpUrl,
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const project = await prisma.clientProject.findUnique({
      where: { id: input.projectId },
      select: { id: true },
    });
    if (!project) throw new ActionError("Proje bulunamadı.");

    const row = await prisma.clientProjectAttachment.create({
      data: {
        projectId: input.projectId,
        kind: ClientAttachmentKind.EXTERNAL_LINK,
        name: input.name,
        url: input.url,
        uploadedByEmail: ctx.actor ?? null,
      },
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-attachment.link",
      entity: "ClientProjectAttachment",
      entityId: row.id,
    });

    return { id: row.id };
  },
});

export const uploadClientProjectAttachmentFile = createSafeAction({
  scope: "admin.client-attachment.file",
  schema: z.object({
    projectId: z.string().min(1),
    file: z.instanceof(File),
    name: z.string().trim().max(200).optional().or(z.literal("")),
  }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  toFieldErrors: (err) => err.flatten().fieldErrors,
  handler: async (input, ctx) => {
    const project = await prisma.clientProject.findUnique({
      where: { id: input.projectId },
      select: { id: true },
    });
    if (!project) throw new ActionError("Proje bulunamadı.");

    const mime = resolveUploadMime(input.file);
    if (!isPortalAllowedMime(mime, input.file.name) && !isPortalRarFile(input.file)) {
      throw new ActionError("Desteklenmeyen dosya. PDF, Office, RAR veya görsel/video kullanın.");
    }
    if (input.file.size > MAX_PORTAL_MEDIA_BYTES) {
      throw new ActionError("Dosya çok büyük (max 50MB).");
    }

    const bytes = Buffer.from(await input.file.arrayBuffer());
    const uploaded = await uploadToCloudinary({
      buffer: bytes,
      mimeType: isPortalRarFile(input.file) ? "application/vnd.rar" : mime,
      actor: ctx.actor,
      folderKind: "portal",
      originalFilename: input.file.name,
    });

    const row = await prisma.clientProjectAttachment.create({
      data: {
        projectId: input.projectId,
        kind: ClientAttachmentKind.FILE,
        name: input.name?.trim() || input.file.name.slice(0, 200),
        url: uploaded.secureUrl,
        cloudinaryPublicId: uploaded.publicId,
        mimeType: mime,
        uploadedByEmail: ctx.actor ?? null,
      },
    });

    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-attachment.file",
      entity: "ClientProjectAttachment",
      entityId: row.id,
    });

    return { id: row.id };
  },
});

export const deleteClientProjectAttachment = createSafeAction({
  scope: "admin.client-attachment.delete",
  schema: z.object({ id: z.string().min(1) }),
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  handler: async (input, ctx) => {
    await prisma.clientProjectAttachment.delete({ where: { id: input.id } });
    await auditAdmin({
      actor: ctx.actor ?? "unknown",
      action: "client-attachment.delete",
      entity: "ClientProjectAttachment",
      entityId: input.id,
    });
    return { id: input.id };
  },
});
