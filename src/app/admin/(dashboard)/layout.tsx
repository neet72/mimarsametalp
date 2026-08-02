import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/security/admin";

const AdminDashboardShell = dynamic(
  () =>
    import("@/components/admin/AdminDashboardShell").then((m) => ({
      default: m.AdminDashboardShell,
    })),
  {
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-900 text-zinc-500">
        Panel yükleniyor…
      </div>
    ),
  },
);

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email;
  const isAdmin = session?.user?.role === "admin" || isAdminEmail(email ?? null);
  if (!email || !isAdmin) {
    redirect("/admin/login");
  }

  return <AdminDashboardShell userEmail={email}>{children}</AdminDashboardShell>;
}
