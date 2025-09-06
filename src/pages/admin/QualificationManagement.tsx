import { Card, CardContent } from "@/components/ui/card";
import { QualificationManagement as QualificationManagementComponent } from "@/components/admin/QualificationManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function QualificationManagement() {
  return (
    <AdminLayout 
      title="Qualifications"
      description="Manage certification categories"
    >
      <Card>
        <CardContent className="p-6">
          <QualificationManagementComponent />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}