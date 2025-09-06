import { Card, CardContent } from "@/components/ui/card";
import { KnowledgeBaseAdmin } from "@/components/knowledge-base/KnowledgeBaseAdmin";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function KnowledgeBase() {
  return (
    <AdminLayout 
      title="Knowledge Base"
      description="Manage articles and categories"
    >
      <Card>
        <CardContent className="p-6">
          <KnowledgeBaseAdmin />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}