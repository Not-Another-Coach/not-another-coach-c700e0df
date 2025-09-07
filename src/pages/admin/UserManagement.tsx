import { UserManagement as UserManagementComponent } from "@/components/admin/UserManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function UserManagement() {
  return (
    <AdminLayout>
      <UserManagementComponent />
    </AdminLayout>
  );
}