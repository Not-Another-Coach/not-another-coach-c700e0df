import { SpecialtyManagement as SpecialtyManagementComponent } from "@/components/admin/SpecialtyManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function SpecialtyManagement() {
  return (
    <AdminLayout>
      <SpecialtyManagementComponent />
    </AdminLayout>
  );
}