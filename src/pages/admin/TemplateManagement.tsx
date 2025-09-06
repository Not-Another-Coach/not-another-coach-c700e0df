import { Card, CardContent } from "@/components/ui/card";
import TemplateSectionsManagement from "@/components/admin/TemplateSectionsManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function TemplateManagement() {
  return (
    <AdminLayout 
      title="Template Management"
      description="Manage onboarding templates"
    >
      <Card>
        <CardContent className="p-6">
          <TemplateSectionsManagement />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}