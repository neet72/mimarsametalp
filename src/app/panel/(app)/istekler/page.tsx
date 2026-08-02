import { requireClient } from "@/actions/client/guard";
import { listClientProjectsForUser } from "@/lib/portal/queries";
import { PanelDeliveryForm } from "@/components/panel/PanelDeliveryForm";

export default async function PanelRequestsPage() {
  const { client } = await requireClient();
  const projects = await listClientProjectsForUser(client.id);

  return (
    <div className="space-y-8">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">İstekler</h1>
        <p className="mt-2 text-muted">
          Proje ile ilgili taleplerinizi, sorularınızı veya değişiklik isteklerinizi buradan iletin. Ofis
          tarafına e-posta ile de düşer.
        </p>
      </div>
      <PanelDeliveryForm
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
        defaults={{ fullName: client.fullName, phone: client.phone ?? "" }}
      />
    </div>
  );
}
