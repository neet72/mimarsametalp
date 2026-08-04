import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminClientUpdateEditor } from "@/components/admin/portal/AdminClientUpdateEditor";
import { AdminClientUpdatesList } from "@/components/admin/portal/AdminClientUpdatesList";
import {
  AdminPageHeader,
  adminBtnSecondaryClass,
} from "@/components/admin/ui/AdminPageChrome";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

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
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <AdminPageHeader
        title="Güncellemeler"
        description={project.title}
        actions={
          <Link
            href={`/admin/client-projects/${projectId}`}
            className={cn(adminBtnSecondaryClass, "w-full justify-center sm:w-auto")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Projeye dön
          </Link>
        }
      />

      <AdminClientUpdateEditor
        key={editing?.id ?? "new"}
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

      <section className="space-y-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Kayıtlar
        </h2>
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
