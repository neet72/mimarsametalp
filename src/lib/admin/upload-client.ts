/**
 * Admin medya yükleme — tarayıcıdan doğrudan Cloudinary (Vercel/Next body 413’ü aşar).
 */

import {
  MAX_ADMIN_IMAGE_BYTES,
  MAX_ADMIN_VIDEO_BYTES,
  formatBytesMb,
} from "@/lib/admin/upload-limits";
import { withCloudinaryAutoFormat } from "@/lib/storage/cloudinary-url";

export type AdminUploadOk = { ok: true; url: string };
export type AdminUploadErr = { ok: false; error: string };
export type AdminUploadResult = AdminUploadOk | AdminUploadErr;

type SignOk = {
  ok: true;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "video" | "raw" | "auto";
};

export async function uploadAdminMediaViaApi(file: File): Promise<AdminUploadResult> {
  const name = file.name.toLowerCase();
  let mime = (file.type || "").toLowerCase();
  if (!mime) {
    if (/\.(png)$/.test(name)) mime = "image/png";
    else if (/\.(jpe?g)$/.test(name)) mime = "image/jpeg";
    else if (/\.(webp)$/.test(name)) mime = "image/webp";
    else if (/\.(gif)$/.test(name)) mime = "image/gif";
    else if (/\.(mp4|m4v)$/.test(name)) mime = "video/mp4";
    else if (/\.(webm)$/.test(name)) mime = "video/webm";
    else if (/\.(mov)$/.test(name)) mime = "video/quicktime";
  }

  const isVideo = mime.startsWith("video/");
  const isImage = mime.startsWith("image/");
  if (!isImage && !isVideo) {
    return { ok: false, error: "Desteklenmeyen dosya türü. (görsel veya video)" };
  }

  const max = isVideo ? MAX_ADMIN_VIDEO_BYTES : MAX_ADMIN_IMAGE_BYTES;
  if (file.size > max) {
    return {
      ok: false,
      error: isVideo
        ? `Video çok büyük (${formatBytesMb(file.size)} / max ${formatBytesMb(max)}).`
        : `Görsel çok büyük (${formatBytesMb(file.size)} / max ${formatBytesMb(max)}).`,
    };
  }

  // 1) Kısa imza isteği (dosya sunucuya gitmez — 413 yok)
  let signRes: Response;
  try {
    signRes = await fetch("/api/admin/upload/sign", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mimeType: mime || (isVideo ? "video/mp4" : "image/jpeg"),
        filename: file.name,
        size: file.size,
      }),
    });
  } catch {
    return { ok: false, error: "Ağ hatası. Bağlantınızı kontrol edip tekrar deneyin." };
  }

  let signJson: unknown = null;
  try {
    signJson = await signRes.json();
  } catch {
    return { ok: false, error: `İmza alınamadı (${signRes.status}).` };
  }

  const signObj = signJson && typeof signJson === "object" ? (signJson as Record<string, unknown>) : null;
  if (!signRes.ok || signObj?.ok !== true) {
    const err =
      signObj && typeof signObj.error === "string" && signObj.error.trim()
        ? signObj.error
        : `İmza alınamadı (${signRes.status}).`;
    return { ok: false, error: err };
  }

  const signed = signObj as unknown as SignOk;

  // 2) Doğrudan Cloudinary
  const endpoint = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`;
  const fd = new FormData();
  fd.set("file", file);
  fd.set("api_key", signed.apiKey);
  fd.set("timestamp", String(signed.timestamp));
  fd.set("signature", signed.signature);
  fd.set("folder", signed.folder);
  fd.set("public_id", signed.publicId);
  fd.set("unique_filename", "true");
  fd.set("overwrite", "false");

  let cloudRes: Response;
  try {
    cloudRes = await fetch(endpoint, { method: "POST", body: fd });
  } catch {
    return { ok: false, error: "Cloudinary’ye bağlanılamadı. Tekrar deneyin." };
  }

  let cloudJson: unknown = null;
  try {
    cloudJson = await cloudRes.json();
  } catch {
    return { ok: false, error: `Cloudinary yanıtı okunamadı (${cloudRes.status}).` };
  }

  const cloud = cloudJson && typeof cloudJson === "object" ? (cloudJson as Record<string, unknown>) : null;
  const secureUrl = cloud && typeof cloud.secure_url === "string" ? cloud.secure_url : "";
  if (!cloudRes.ok || !secureUrl) {
    const msg =
      cloud && typeof cloud.error === "object" && cloud.error && "message" in (cloud.error as object)
        ? String((cloud.error as { message?: string }).message ?? "")
        : "";
    return {
      ok: false,
      error: msg.trim() || `Cloudinary yükleme başarısız (${cloudRes.status}).`,
    };
  }

  return { ok: true, url: withCloudinaryAutoFormat(secureUrl) };
}
