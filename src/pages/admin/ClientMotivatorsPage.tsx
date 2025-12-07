import { AdminLayout } from "@/components/admin/AdminLayout";
import { ClientMotivatorsManager } from "@/components/admin/ClientMotivatorsManager";

export default function ClientMotivatorsPage() {
  return (
    <AdminLayout title="Client Motivators" description="Manage client motivation factors and their mappings to activities">
      <ClientMotivatorsManager />
    </AdminLayout>
  );
}
