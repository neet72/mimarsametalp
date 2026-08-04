import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminClientUpdateEditor } from "@/components/admin/portal/AdminClientUpdateEditor";
import { AdminClientUpdatesList } from "@/components/admin/portal/AdminClientUpdatesList";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminClientProjectUpdatesPage({ params, searchParams }: Props) {
  const { id: projectId } = await params;
  const sp = (await searchParams) ?? {};
  const editId = typeof sp.id === "string" ? sp.id : undefined;

  const project = await prisma.clientProject.findUnique({
    where: { id: projectId },
    include: {
      stages: { orderBy: { orderIndex: "asc" }, select: { id: true, name: true } },
      updates: {
        orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
        include: { media: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!project) notFound();

  const editing = editId ? project.updates.find((u) => u.id === editId) : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-zinc-100">Güncellemeler</h1>
          <p className="text-sm text-zinc-500">{project.title}</p>
        </div>
        <Link href={`/admin/client-projects/${projectId}`} className="text-sm text-zinc-500">
          ← Proje
        </Link>
      </div>

      <AdminClientUpdateEditor
        projectId={projectId}
        stages={project.stages}
        initial={
          editing
            ? {
                id: editing.id,
                title: editing.title,
                body: editing.body,
                stageId: editing.stageId,
                isPublished: editing.isPublished,
                eventDate: editing.eventDate?.toISOString() ?? null,
                media: editing.media.map((m) => ({
                  id: m.id,
                  cloudinaryUrl: m.cloudinaryUrl,
                  mediaType: m.mediaType,
                  caption: m.caption,
                })),
              }
            : undefined
        }
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Kayıtlar</h2>
        <AdminClientUpdatesList
          projectId={projectId}
          updates={project.updates.map((u) => ({
            id: u.id,
            title: u.title,
            isPublished: u.isPublished,
            eventDate: u.eventDate?.toISOString() ?? null,
          }))}
        />
      </section>
    </div>
  );
}
