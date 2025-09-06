import { Card, CardContent } from "@/components/ui/card";
import { ProfilePublicationManagement } from "@/components/admin/ProfilePublicationManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function ProfilePublications() {
  return (
    <AdminLayout 
      title="Profile Publications"
      description="Review and approve profile publication requests"
    >
      <Card>
        <CardContent className="p-6">
          <ProfilePublicationManagement />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}