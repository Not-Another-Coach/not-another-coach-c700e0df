import { FeedbackQuestionBuilder } from "@/components/admin/FeedbackQuestionBuilder";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function FeedbackBuilder() {
  return (
    <AdminLayout>
      <FeedbackQuestionBuilder />
    </AdminLayout>
  );
}