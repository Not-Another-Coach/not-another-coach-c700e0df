import { AdminLayout } from "@/components/admin/AdminLayout";
import { SystemSettings } from "@/components/admin/SystemSettings";

export const AdminSystemSettings = () => {
  return (
    <AdminLayout 
      title="System Settings"
      description="Configure application-wide settings and branding"
    >
      <SystemSettings />
    </AdminLayout>
  );
};