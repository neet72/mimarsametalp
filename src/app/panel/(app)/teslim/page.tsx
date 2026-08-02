import { requireClient } from "@/actions/client/guard";
import { listClientProjectsForUser } from "@/lib/portal/queries";
import { PanelDeliveryForm } from "@/components/panel/PanelDeliveryForm";

export default async function PanelDeliveryPage() {
  const { client } = await requireClient();
  const projects = await listClientProjectsForUser(client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Teslim talebi</h1>
        <p className="mt-2 text-muted">Adres ve iletişim bilgilerinizi iletin.</p>
      </div>
      <PanelDeliveryForm
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
        defaults={{ fullName: client.fullName, phone: client.phone ?? "" }}
      />
    </div>
  );
}
