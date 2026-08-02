import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminClientProjectForm } from "@/components/admin/portal/AdminClientProjectForm";
import { AdminClientProjectHeaderActions } from "@/components/admin/portal/AdminClientProjectHeaderActions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminClientProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const [project, clients] = await Promise.all([
    prisma.clientProject.findUnique({
      where: { id },
      include: {
        members: true,
        stages: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.clientUser.findMany({
      select: { id: true, fullName: true, username: true },
      orderBy: { fullName: "asc" },
    }),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-zinc-100">{project.title}</h1>
        <AdminClientProjectHeaderActions projectId={project.id} title={project.title} />
      </div>
      <AdminClientProjectForm
        mode="edit"
        clients={clients}
        initial={{
          id: project.id,
          title: project.title,
          address: project.address,
          status: project.status,
          coverImageUrl: project.coverImageUrl,
          clientIds: project.members.map((m) => m.clientId),
        }}
        stages={project.stages.map((s) => ({
          id: s.id,
          name: s.name,
          orderIndex: s.orderIndex,
          status: s.status,
          targetDate: s.targetDate?.toISOString() ?? null,
          completedDate: s.completedDate?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
