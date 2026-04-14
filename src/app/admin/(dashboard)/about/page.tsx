import { getSiteContent } from "@/actions/admin/site-content";
import { AboutAdminPanel } from "@/components/admin/AboutAdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const [tr, en] = await Promise.all([getSiteContent("about", "tr"), getSiteContent("about", "en")]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
          Hakkımızda
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mevcut sayfa değişmez; burası içerik panelidir.
        </p>
      </div>

      <AboutAdminPanel initialTr={tr} initialEn={en} />
    </div>
  );
}

