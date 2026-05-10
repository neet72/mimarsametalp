import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import type { ServiceDbRow } from "@/types/service-db";

const ServiceForm = dynamic(() => import("@/components/admin/ServiceForm"), {
  loading: () => <p className="text-sm text-zinc-500">Form yükleniyor…</p>,
});

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditServicePage({ params }: Props) {
  const { id } = await params;
  let service;
  try {
    service = await prisma.service.findUnique({ where: { id } });
  } catch {
    throw new Error("Veritabanına bağlanılamadı. DATABASE_URL ve migrate durumunu kontrol edin.");
  }
  if (!service) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/services"
          className="text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-[rgb(200,170,130)]"
        >
          ← Hizmetlere dön
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-zinc-100">Hizmeti düzenle</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Değişiklikler kaydettiğinizde site güncellenir. Web adresindeki kısa ismi (slug) değiştirirseniz eski
          bağlantılar yeni adrese yönlendirilmez — paylaştığınız linkleri güncellemeniz gerekir. «Yayında» kapalıysa
          ziyaretçi bu hizmeti görmez.
        </p>
      </div>
      <ServiceForm mode="edit" service={service as ServiceDbRow} />
    </div>
  );
}
