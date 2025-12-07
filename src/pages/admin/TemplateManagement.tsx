import { TemplateManagementTabs } from "@/components/coach/TemplateManagementTabs";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function TemplateManagement() {
  return (
    <AdminLayout>
      <TemplateManagementTabs />
    </AdminLayout>
  );
}
