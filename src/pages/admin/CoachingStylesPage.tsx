import { AdminLayout } from "@/components/admin/AdminLayout";
import { CoachingStylesManager } from "@/components/admin/CoachingStylesManager";

export default function CoachingStylesPage() {
  return (
    <AdminLayout title="Coaching Styles" description="Manage coaching style options and mappings">
      <CoachingStylesManager />
    </AdminLayout>
  );
}
