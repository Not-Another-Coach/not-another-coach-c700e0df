import { Card, CardContent } from "@/components/ui/card";
import { SpecialtyAnalyticsDashboard } from "@/components/admin/SpecialtyAnalyticsDashboard";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function SpecialtyAnalytics() {
  return (
    <AdminLayout 
      title="Specialty Analytics"
      description="View specialty performance data"
    >
      <Card>
        <CardContent className="p-6">
          <SpecialtyAnalyticsDashboard />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}