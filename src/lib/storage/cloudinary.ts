import "server-only";

import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/lib/observability/logger";

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
}): Promise<CloudinaryUploadResult> {
  if (!configureCloudinary()) {
    logger.error({ msg: "cloudinary not configured", scope: "storage.cloudinary", actor: opts.actor });
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  const isVideo = opts.mimeType.startsWith("video/");
  const folder = isVideo ? "samet-alp/videos" : "samet-alp/images";
  const publicId = `${folder}/${crypto.randomUUID()}`;

  const res = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        unique_filename: true,
        overwrite: false,
        resource_type: "auto",
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
        else resolve(result);
      },
    );
    stream.end(opts.buffer);
  });

  const secureUrl = typeof res?.secure_url === "string" ? res.secure_url : "";
  if (!secureUrl) throw new Error("CLOUDINARY_UPLOAD_FAILED");

  const resourceType = (res?.resource_type as "image" | "video" | "raw" | undefined) ?? "raw";
  const eagerThumb = isVideo ? (res?.eager?.[0]?.secure_url as string | undefined) : undefined;

  return {
    publicId: String(res?.public_id ?? publicId),
    resourceType,
    secureUrl: withAutoFormatQuality(secureUrl),
    thumbnailUrl: eagerThumb ? withAutoFormatQuality(eagerThumb) : undefined,
  };
}

