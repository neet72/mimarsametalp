import dynamic from "next/dynamic";

const AdminLoginForm = dynamic(
  () => import("@/components/admin/AdminLoginForm").then((m) => ({ default: m.AdminLoginForm })),
  {
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        Yükleniyor…
      </div>
    ),
  },
);

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <AdminLoginForm />
    </div>
  );
}
