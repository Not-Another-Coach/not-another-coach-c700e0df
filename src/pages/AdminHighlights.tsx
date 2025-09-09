import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { HighlightsOverview } from "@/components/admin/highlights/HighlightsOverview";
import { SubmissionReview } from "@/components/admin/highlights/SubmissionReview";
import { ContentManagement } from "@/components/admin/highlights/ContentManagement";
import { HighlightsAnalytics } from "@/components/admin/highlights/HighlightsAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminHighlights = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Highlights Management</h1>
          <p className="text-muted-foreground">
            Manage trainer content submissions and curate today's highlights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="review">Review Submissions</TabsTrigger>
            <TabsTrigger value="content">Content Library</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <HighlightsOverview />
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <SubmissionReview />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <HighlightsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};