import { QualificationManagement as QualificationManagementComponent } from "@/components/admin/QualificationManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function QualificationManagement() {
  return (
    <AdminLayout>
      <QualificationManagementComponent />
    </AdminLayout>
  );
}