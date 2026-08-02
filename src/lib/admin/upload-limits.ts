/** Admin yükleme boyut limitleri (client + server ortak). */

export const MAX_ADMIN_IMAGE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_ADMIN_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB

export function formatBytesMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
