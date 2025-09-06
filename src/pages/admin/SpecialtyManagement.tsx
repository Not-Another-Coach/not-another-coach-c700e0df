import { Card, CardContent } from "@/components/ui/card";
import { SpecialtyManagement as SpecialtyManagementComponent } from "@/components/admin/SpecialtyManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function SpecialtyManagement() {
  return (
    <AdminLayout 
      title="Specialties & Training"
      description="Manage specialty categories"
    >
      <Card>
        <CardContent className="p-6">
          <SpecialtyManagementComponent />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}