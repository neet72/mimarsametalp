import { ServicesAdminPanel } from "@/components/admin/ServicesAdminPanel";

export default function AdminServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
          Hizmetler
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Hizmet içeriklerini buradan yönetebilirsiniz. Mevcut bloklar kaldırılmadı; yeni panel
          eklendi.
        </p>
      </div>

      <ServicesAdminPanel />
    </div>
  );
}

