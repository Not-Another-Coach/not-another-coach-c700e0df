import { Card, CardContent } from "@/components/ui/card";
import { VerificationAnalytics as VerificationAnalyticsComponent } from "@/components/admin/VerificationAnalytics";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function VerificationAnalytics() {
  return (
    <AdminLayout 
      title="Verification Analytics"
      description="Monitor verification trends"
    >
      <Card>
        <CardContent className="p-6">
          <VerificationAnalyticsComponent />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}