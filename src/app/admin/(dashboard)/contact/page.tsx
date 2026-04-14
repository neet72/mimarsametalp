import { getSiteContent } from "@/actions/admin/site-content";
import { ContactAdminPanel } from "@/components/admin/ContactAdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const [tr, en] = await Promise.all([
    getSiteContent("contact", "tr"),
    getSiteContent("contact", "en"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
          İletişim
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mevcut sayfa değişmez; burası içerik panelidir.
        </p>
      </div>

      <ContactAdminPanel initialTr={tr} initialEn={en} />
    </div>
  );
}

