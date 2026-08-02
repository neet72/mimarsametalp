import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminClientProjectForm } from "@/components/admin/portal/AdminClientProjectForm";

export const dynamic = "force-dynamic";

export default async function AdminClientProjectNewPage() {
  const clients = await prisma.clientUser.findMany({
    where: { active: true },
    select: { id: true, fullName: true, username: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-zinc-100">Yeni müşteri projesi</h1>
        <Link href="/admin/client-projects" className="text-sm text-zinc-500">
          ← Liste
        </Link>
      </div>
      <AdminClientProjectForm mode="create" clients={clients} />
    </div>
  );
}
