import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

const ProjectForm = dynamic(() => import("@/components/admin/ProjectForm"), {
  loading: () => <p className="text-sm text-zinc-500">Form yükleniyor…</p>,
});

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProjectPage({ params }: Props) {
  const { id } = await params;
  let project;
  try {
    project = await prisma.project.findUnique({ where: { id } });
  } catch {
    throw new Error("Veritabanına bağlanılamadı. DATABASE_URL ve migrate durumunu kontrol edin.");
  }
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/projects"
          className="text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-[rgb(200,170,130)]"
        >
          ← Projeler
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-zinc-100">
          Projeyi düzenle
        </h1>
      </div>
      <ProjectForm mode="edit" project={project} />
    </div>
  );
}
