import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminClientForm } from "@/components/admin/portal/AdminClientForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminClientEditPage({ params }: Props) {
  const { id } = await params;
  const [client, projects] = await Promise.all([
    prisma.clientUser.findUnique({
      where: { id },
      include: { projects: { select: { projectId: true } } },
    }),
    prisma.clientProject.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-zinc-100">{client.fullName}</h1>
        <Link href="/admin/clients" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Liste
        </Link>
      </div>
      <AdminClientForm
        mode="edit"
        projects={projects}
        initial={{
          id: client.id,
          fullName: client.fullName,
          username: client.username,
          email: client.email,
          phone: client.phone,
          adminVisiblePassword: client.adminVisiblePassword,
          notifyEmail: client.notifyEmail,
          notifySms: client.notifySms,
          active: client.active,
          projectIds: client.projects.map((p) => p.projectId),
        }}
      />
    </div>
  );
}
