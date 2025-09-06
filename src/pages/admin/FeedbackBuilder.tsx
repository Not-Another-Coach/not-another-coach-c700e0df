import { Card, CardContent } from "@/components/ui/card";
import { FeedbackQuestionBuilder } from "@/components/admin/FeedbackQuestionBuilder";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function FeedbackBuilder() {
  return (
    <AdminLayout 
      title="Feedback Builder"
      description="Create discovery call questions"
    >
      <Card>
        <CardContent className="p-6">
          <FeedbackQuestionBuilder />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}