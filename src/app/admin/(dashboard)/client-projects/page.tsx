import { prisma } from "@/lib/db/prisma";
import { AdminClientProjectsList } from "@/components/admin/portal/AdminClientProjectsList";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPrimaryButton,
} from "@/components/admin/ui/AdminPageChrome";

export const dynamic = "force-dynamic";

export default async function AdminClientProjectsPage() {
  const projects = await prisma.clientProject.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { members: true, stages: true, updates: true } },
    },
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Portal projeleri"
        description="Müşteri paneline özel işler — portfolyo CMS projelerinden ayrıdır."
        actions={<AdminPrimaryButton href="/admin/client-projects/new">Yeni portal projesi</AdminPrimaryButton>}
      />

      {projects.length === 0 ? (
        <AdminEmptyState
          title="Henüz portal projesi yok"
          hint="Müşteriye atayacağınız şantiyeyi / işi burada oluşturun; ardından aşama ve güncelleme ekleyin."
          actionHref="/admin/client-projects/new"
          actionLabel="İlk projeyi oluştur"
        />
      ) : (
        <AdminClientProjectsList
          projects={projects.map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            address: p.address,
            memberCount: p._count.members,
            stageCount: p._count.stages,
            updateCount: p._count.updates,
          }))}
        />
      )}
    </div>
  );
}
