import "server-only";

import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/lib/observability/logger";
import { extensionFromFilenameOrMime } from "@/lib/storage/cloudinary-url";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

export function configureCloudinary() {
  if (!isCloudinaryConfigured()) return false;
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

export type CloudinaryUploadResult = {
  publicId: string;
  resourceType: "image" | "video" | "raw";
  secureUrl: string;
  thumbnailUrl?: string;
};

function withAutoFormatQuality(url: string) {
  // Insert f_auto,q_auto right after /upload/
  // Works for both image and video delivery URLs.
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

export async function uploadToCloudinary(opts: {
  buffer: Buffer;
  mimeType: string;
  actor?: string;
  /** Varsayılan portfolyo klasörleri; portal medyası için `portal` kullanın. */
  folderKind?: "portfolio" | "portal";
  /** Orijinal dosya adı — public_id uzantısı ve indirme adı için. */
  originalFilename?: string;
}): Promise<CloudinaryUploadResult> {
  if (!configureCloudinary()) {
    logger.error({ msg: "cloudinary not configured", scope: "storage.cloudinary", actor: opts.actor });
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  const isVideo = opts.mimeType.startsWith("video/");
  const isImage = opts.mimeType.startsWith("image/");
  const isRawDoc = !isVideo && !isImage;
  const kind = opts.folderKind ?? "portfolio";
  const folder =
    kind === "portal"
      ? isVideo
        ? "samet-alp/portal/videos"
        : isRawDoc
          ? "samet-alp/portal/docs"
          : "samet-alp/portal/images"
      : isVideo
        ? "samet-alp/videos"
        : isRawDoc
          ? "samet-alp/docs"
          : "samet-alp/images";
  // UUID + uzantı: indirmede tarayıcı doğru tip/adı tanısın; folder ayrı verilir (çift yol yok).
  const ext = extensionFromFilenameOrMime(opts.originalFilename, opts.mimeType);
  const publicId = `${crypto.randomUUID()}${ext}`;

  type CloudinaryEagerItem = { secure_url?: string };
  type CloudinaryUploadApiResponse = {
    secure_url?: string;
    public_id?: string;
    resource_type?: "image" | "video" | "raw";
    eager?: CloudinaryEagerItem[];
  };

  const res = await new Promise<CloudinaryUploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        unique_filename: true,
        overwrite: false,
        use_filename: false,
        // Dokümanlar (PDF/Word/Excel) raw; görsel/video auto.
        resource_type: isRawDoc ? "raw" : "auto",
        ...(isVideo
          ? {
              // Derive a poster/thumbnail from the first frame.
              eager: [
                {
                  // Take first frame (start_offset 0) and output as webp.
                  // NOTE: Cloudinary will return eager[0].secure_url for derived asset.
                  transformation: [{ start_offset: 0 }],
                  format: "webp",
                },
              ],
              eager_async: false,
            }
          : {}),
      },
      (error, result) => {
        if (error) reject(error);
        else resolve((result ?? {}) as CloudinaryUploadApiResponse);
      },
    );
    stream.end(opts.buffer);
  });

  const secureUrl = typeof res?.secure_url === "string" ? res.secure_url : "";
  if (!secureUrl) throw new Error("CLOUDINARY_UPLOAD_FAILED");

  const resourceType = (res?.resource_type as "image" | "video" | "raw" | undefined) ?? (isRawDoc ? "raw" : "image");
  const eagerThumb = isVideo ? (res?.eager?.[0]?.secure_url as string | undefined) : undefined;

  return {
    publicId: String(res?.public_id ?? publicId),
    resourceType,
    // f_auto raw/PDF URL’lerini bozabilir — sadece görsel/video.
    secureUrl: isRawDoc ? secureUrl : withAutoFormatQuality(secureUrl),
    thumbnailUrl: eagerThumb ? withAutoFormatQuality(eagerThumb) : undefined,
  };
}

