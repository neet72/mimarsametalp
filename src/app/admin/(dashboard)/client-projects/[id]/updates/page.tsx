import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminClientUpdateEditor } from "@/components/admin/portal/AdminClientUpdateEditor";

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
        orderBy: { createdAt: "desc" },
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
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {project.updates.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="text-zinc-100">{u.title}</p>
                <p className="text-zinc-500">{u.isPublished ? "Yayında" : "Taslak"}</p>
              </div>
              <Link
                href={`/admin/client-projects/${projectId}/updates?id=${u.id}`}
                className="text-[rgb(166,124,82)] hover:underline"
              >
                Düzenle
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
