import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="mx-auto flex max-w-content flex-col md:flex-row">
        <AdminSidebar />
        <div className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</div>
      </div>
    </AdminGuard>
  );
}
