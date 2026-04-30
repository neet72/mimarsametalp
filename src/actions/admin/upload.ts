"use server";

import { z } from "zod";
import { requireAdmin } from "@/actions/admin/guard";
import { createSafeAction } from "@/lib/actions/safe-action";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { logger } from "@/lib/observability/logger";

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const VIDEO_MIME = ["video/mp4", "video/webm"] as const;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

const uploadSchema = z
  .object({
    file: z.instanceof(File),
  })
  .superRefine((v, ctx) => {
    const type = v.file.type;
    const size = v.file.size;

    const isImage = (IMAGE_MIME as readonly string[]).includes(type);
    const isVideo = (VIDEO_MIME as readonly string[]).includes(type);
    if (!isImage && !isVideo) {
      ctx.addIssue({ code: "custom", message: "Desteklenmeyen dosya türü." });
      return;
    }

    const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (size <= 0) {
      ctx.addIssue({ code: "custom", message: "Dosya boş." });
      return;
    }
    if (size > max) {
      ctx.addIssue({
        code: "custom",
        message: isVideo ? "Video çok büyük (max 50MB)." : "Görsel çok büyük (max 5MB).",
      });
    }
  });

const uploadAction = createSafeAction({
  scope: "admin.media.upload",
  schema: uploadSchema,
  authorize: async () => {
    const session = await requireAdmin();
    return { actor: session.user.email ?? "unknown" };
  },
  invalidMessage: "Dosya geçersiz.",
  failureMessage: "Yükleme başarısız.",
  handler: async ({ file }, ctx) => {
    logger.info({
      msg: "media upload attempt",
      scope: "admin.media.upload",
      actor: ctx.actor,
      mime: file.type,
      size: file.size,
    });

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary({
      buffer: bytes,
      mimeType: file.type,
      actor: ctx.actor,
    });

    logger.info({
      msg: "media uploaded to cloudinary",
      scope: "admin.media.upload",
      actor: ctx.actor,
      publicId: uploaded.publicId,
      resourceType: uploaded.resourceType,
    });

    return { url: uploaded.secureUrl, thumbnailUrl: uploaded.thumbnailUrl };
  },
});

export async function uploadAdminMedia(formData: FormData) {
  const file = formData.get("file");
  return uploadAction({ file });
}

