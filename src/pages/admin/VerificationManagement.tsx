import { Card, CardContent } from "@/components/ui/card";
import { EnhancedVerificationManagement } from "@/components/admin/EnhancedVerificationManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function VerificationManagement() {
  return (
    <AdminLayout 
      title="Verification System"
      description="Manage trainer verification requests"
    >
      <Card>
        <CardContent className="p-6">
          <EnhancedVerificationManagement />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}