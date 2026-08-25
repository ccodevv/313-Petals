import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { requireAdmin } from "@/features/authentication/queries";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar profile={profile} />
        <main className="flex-1 bg-stone-50/50 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
