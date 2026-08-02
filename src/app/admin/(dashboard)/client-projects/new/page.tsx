import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminClientProjectForm } from "@/components/admin/portal/AdminClientProjectForm";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageChrome";

export const dynamic = "force-dynamic";

export default async function AdminClientProjectNewPage() {
  const clients = await prisma.clientUser.findMany({
    where: { active: true },
    select: { id: true, fullName: true, username: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Yeni portal projesi"
        description="Müşteriye atanacak şantiye / iş kaydı."
        actions={
          <Link href="/admin/client-projects" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Liste
          </Link>
        }
      />
      <AdminClientProjectForm mode="create" clients={clients} />
    </div>
  );
}
