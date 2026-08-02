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
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

function resolveFolder(opts: {
  mimeType: string;
  folderKind?: "portfolio" | "portal";
}) {
  const isVideo = opts.mimeType.startsWith("video/");
  const isImage = opts.mimeType.startsWith("image/");
  const isRawDoc = !isVideo && !isImage;
  const kind = opts.folderKind ?? "portfolio";
  if (kind === "portal") {
    if (isVideo) return "samet-alp/portal/videos";
    if (isRawDoc) return "samet-alp/portal/docs";
    return "samet-alp/portal/images";
  }
  if (isVideo) return "samet-alp/videos";
  if (isRawDoc) return "samet-alp/docs";
  return "samet-alp/images";
}

export type SignedDirectUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  /** Cloudinary endpoint resource type segment */
  resourceType: "image" | "video" | "raw" | "auto";
};

/** Tarayıcıdan doğrudan Cloudinary’ye yüklemek için imzalı parametreler. */
export function createSignedDirectUpload(opts: {
  mimeType: string;
  originalFilename?: string;
  folderKind?: "portfolio" | "portal";
}): SignedDirectUpload {
  if (!configureCloudinary()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  const isVideo = opts.mimeType.startsWith("video/");
  const isImage = opts.mimeType.startsWith("image/");
  const isRawDoc = !isVideo && !isImage;
  const folder = resolveFolder(opts);
  const ext = extensionFromFilenameOrMime(opts.originalFilename, opts.mimeType);
  const publicId = `${crypto.randomUUID()}${ext}`;
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder,
    public_id: publicId,
    timestamp,
    unique_filename: "true",
    overwrite: "false",
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET);

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder,
    publicId,
    resourceType: isRawDoc ? "raw" : "auto",
  };
}

export async function uploadToCloudinary(opts: {
  buffer: Buffer;
  mimeType: string;
  actor?: string;
  folderKind?: "portfolio" | "portal";
  originalFilename?: string;
}): Promise<CloudinaryUploadResult> {
  if (!configureCloudinary()) {
    logger.error({ msg: "cloudinary not configured", scope: "storage.cloudinary", actor: opts.actor });
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  const isVideo = opts.mimeType.startsWith("video/");
  const isImage = opts.mimeType.startsWith("image/");
  const isRawDoc = !isVideo && !isImage;
  const folder = resolveFolder(opts);
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
        resource_type: isRawDoc ? "raw" : "auto",
        ...(isVideo
          ? {
              eager: [
                {
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
    secureUrl: isRawDoc ? secureUrl : withAutoFormatQuality(secureUrl),
    thumbnailUrl: eagerThumb ? withAutoFormatQuality(eagerThumb) : undefined,
  };
}
