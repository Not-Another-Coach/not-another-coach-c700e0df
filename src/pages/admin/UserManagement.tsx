import { Card, CardContent } from "@/components/ui/card";
import { UserManagement as UserManagementComponent } from "@/components/admin/UserManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function UserManagement() {
  return (
    <AdminLayout 
      title="User Management"
      description="Manage users, roles, and permissions"
    >
      <Card>
        <CardContent className="p-6">
          <UserManagementComponent />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}