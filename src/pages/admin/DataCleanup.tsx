import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientTrainerCleanup } from "@/components/admin/ClientTrainerCleanup";
import { TestUserCleanup } from "@/components/admin/TestUserCleanup";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function DataCleanup() {
  return (
    <AdminLayout 
      title="Data Cleanup Tools"
      description="Clean up test data and interactions"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client-Trainer Cleanup</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientTrainerCleanup />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test User Cleanup</CardTitle>
          </CardHeader>
          <CardContent>
            <TestUserCleanup />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}