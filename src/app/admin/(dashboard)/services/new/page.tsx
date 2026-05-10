import dynamic from "next/dynamic";
import Link from "next/link";
import { ServiceAdminGuide } from "@/components/admin/ServiceAdminGuide";

const ServiceForm = dynamic(() => import("@/components/admin/ServiceForm"), {
  loading: () => <p className="text-sm text-zinc-500">Form yükleniyor…</p>,
});

export default function AdminNewServicePage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/services"
          className="text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-[rgb(200,170,130)]"
        >
          ← Hizmetlere dön
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-zinc-100">Yeni hizmet</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          <span className="text-zinc-300">Adım adım:</span> 1) Başlığı yazın — adres satırı (slug) genelde kendi
          gelir. 2) İsterseniz görsel yükleyin. 3) «Kaydet»e basın. Detaylı maddeleri sonra açabilirsiniz; acele
          etmeyin.
        </p>
        <div className="mt-4 max-w-xl">
          <ServiceAdminGuide variant="embed" />
        </div>
      </div>
      <ServiceForm mode="create" />
    </div>
  );
}
