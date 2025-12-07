import { AdminLayout } from "@/components/admin/AdminLayout";
import { ClientGoalManagement } from "@/components/admin/ClientGoalManagement";

export default function GoalManagement() {
  return (
    <AdminLayout title="Goal Management" description="Configure client-facing goals and specialty mappings">
      <ClientGoalManagement />
    </AdminLayout>
  );
}
