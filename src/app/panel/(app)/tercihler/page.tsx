import { requireClient } from "@/actions/client/guard";
import { PanelPreferencesForm } from "@/components/panel/PanelPreferencesForm";

export default async function PanelPreferencesPage() {
  const { client } = await requireClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Tercihler</h1>
        <p className="mt-2 text-muted">Bildirim, iletişim ve isteğe bağlı şifre güncelleme.</p>
      </div>
      <PanelPreferencesForm
        initial={{
          email: client.email ?? "",
          phone: client.phone ?? "",
          notifyEmail: client.notifyEmail,
          notifySms: client.notifySms,
        }}
      />
    </div>
  );
}
