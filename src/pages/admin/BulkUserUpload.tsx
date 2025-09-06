import { Card, CardContent } from "@/components/ui/card";
import { BulkUserUpload as BulkUserUploadComponent } from "@/components/admin/BulkUserUpload";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function BulkUserUpload() {
  return (
    <AdminLayout 
      title="Bulk User Upload"
      description="Import users in bulk from CSV files"
    >
      <Card>
        <CardContent className="p-6">
          <BulkUserUploadComponent />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}