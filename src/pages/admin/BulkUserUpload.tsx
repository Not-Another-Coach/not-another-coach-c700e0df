import { BulkUserUpload as BulkUserUploadComponent } from "@/components/admin/BulkUserUpload";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function BulkUserUpload() {
  return (
    <AdminLayout>
      <BulkUserUploadComponent />
    </AdminLayout>
  );
}