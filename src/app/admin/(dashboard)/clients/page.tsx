import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminClientForm } from "@/components/admin/portal/AdminClientForm";
import { AdminClientsList } from "@/components/admin/portal/AdminClientsList";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageChrome";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const [clients, projects] = await Promise.all([
    prisma.clientUser.findMany({
      orderBy: { createdAt: "desc" },
      include: { projects: { select: { projectId: true } } },
    }),
    prisma.clientProject.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Müşteriler"
        description="Portal hesapları, şifre, iletişim bilgileri, giriş durumu ve proje ataması."
        actions={
          <Link
            href="#yeni-hesap"
            className="inline-flex min-h-10 items-center rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-zinc-300 hover:border-zinc-500"
          >
            Yeni hesap
          </Link>
        }
      />

      <section id="yeni-hesap" className="space-y-3 scroll-mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Yeni hesap</h2>
          <p className="text-xs text-zinc-600">{projects.length} portal projesi seçilebilir</p>
        </div>
        <AdminClientForm mode="create" projects={projects} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Kayıtlı ({clients.length})
        </h2>
        <AdminClientsList
          clients={clients.map((c) => ({
            id: c.id,
            fullName: c.fullName,
            username: c.username,
            email: c.email,
            phone: c.phone,
            adminVisiblePassword: c.adminVisiblePassword,
            lastLoginAt: c.lastLoginAt?.toISOString() ?? null,
            active: c.active,
            projectCount: c.projects.length,
          }))}
        />
      </section>
    </div>
  );
}
