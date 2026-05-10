/**
 * Chromium tarafında `<video fetchPriority>` geçerlidir; @types/react sürümüne bağlı olarak eksik kalabiliyor.
 * Dosyanın "modül augmentasyonu" sayılması için side-effect import gerekli.
 */
import "react";

declare module "react" {
  interface VideoHTMLAttributes<T extends HTMLVideoElement> {
    fetchPriority?: "high" | "low" | "auto";
  }
}
