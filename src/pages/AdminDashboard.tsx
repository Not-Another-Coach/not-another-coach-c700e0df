import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent } from "@/components/ui/card";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminLiveActivityFeed } from "@/components/admin/AdminLiveActivityFeed";
import { SpecialtyRequestWidget } from "@/components/alerts/SpecialtyRequestAlerts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Trainer4StatusFixer } from "@/components/admin/Trainer4StatusFixer";
import { LogoManagement } from "@/components/admin/LogoManagement";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <h1 className="text-xl font-semibold mb-4">Access Denied</h1>
            <p>You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Admin Dashboard"
      description="Manage your fitness platform from this central dashboard"
    >
      <div className="space-y-6">
        {/* Logo Management */}
        <LogoManagement />

        {/* Alert Widgets */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <SpecialtyRequestWidget />
              <Trainer4StatusFixer />
            </div>
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