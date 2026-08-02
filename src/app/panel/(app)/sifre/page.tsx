import { redirect } from "next/navigation";

/** Şifre değişimi Tercihler’de; eski URL’yi yönlendir. */
export default function PanelPasswordRedirect() {
  redirect("/panel/tercihler");
}
