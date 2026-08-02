import { auth } from "@/auth";
import { PanelPasswordForm } from "@/components/panel/PanelPasswordForm";

export default async function PanelPasswordPage() {
  const session = await auth();
  return (
    <div className="py-6">
      <PanelPasswordForm forced={Boolean(session?.user?.mustChangePassword)} />
    </div>
  );
}
