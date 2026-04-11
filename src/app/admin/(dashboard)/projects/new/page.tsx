import dynamic from "next/dynamic";
import Link from "next/link";

const ProjectForm = dynamic(() => import("@/components/admin/ProjectForm"), {
  loading: () => <p className="text-sm text-zinc-500">Form yükleniyor…</p>,
});

export default function AdminNewProjectPage() {
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
          Yeni proje
        </h1>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
