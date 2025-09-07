import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminLiveActivityFeed } from "@/components/admin/AdminLiveActivityFeed";
import { SpecialtyRequestWidget } from "@/components/alerts/SpecialtyRequestAlerts";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Alert Widgets */}
        <div className="p-6">
          <SpecialtyRequestWidget />
        </div>

        {/* Analytics Dashboard */}
        <div className="p-6">
          <AdminAnalyticsDashboard onNavigate={(tab) => window.location.href = `/admin/${tab}`} />
        </div>

        {/* Live Activity Feed */}
        <div className="p-6">
          <AdminLiveActivityFeed />
        </div>
      </div>
    </AdminLayout>
  );
};