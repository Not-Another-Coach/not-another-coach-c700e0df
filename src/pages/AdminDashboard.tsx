import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminLiveActivityFeed } from "@/components/admin/AdminLiveActivityFeed";
import { SpecialtyRequestWidget } from "@/components/alerts/SpecialtyRequestAlerts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export const AdminDashboard = () => {
  // AdminLayout handles auth and admin checks with redirect

  return (
    <AdminLayout 
      title="Admin Dashboard"
      description="Manage your fitness platform from this central dashboard"
    >
      <div className="space-y-6">
        {/* Alert Widgets */}
        <Card>
          <CardContent className="p-6">
            <SpecialtyRequestWidget />
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Card>
          <CardContent className="p-6">
            <AdminAnalyticsDashboard onNavigate={(tab) => window.location.href = `/admin/${tab}`} />
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardContent className="p-6">
            <AdminLiveActivityFeed />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};