import { KnowledgeBaseAdmin } from "@/components/knowledge-base/KnowledgeBaseAdmin";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function KnowledgeBase() {
  return (
    <AdminLayout>
      <KnowledgeBaseAdmin />
    </AdminLayout>
  );
}