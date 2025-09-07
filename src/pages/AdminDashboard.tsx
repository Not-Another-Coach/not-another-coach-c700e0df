import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminLiveActivityFeed } from "@/components/admin/AdminLiveActivityFeed";
import { SpecialtyRequestWidget } from "@/components/alerts/SpecialtyRequestAlerts";
import { 
  Users, 
  Shield, 
  FileCheck, 
  BookOpen, 
  Target, 
  Award, 
  BarChart3, 
  MessageCircle, 
  Database, 
  FileText
} from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();

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

  // Navigation items for top menu
  const navigationItems = [
    { key: 'users', label: 'Users', path: '/admin/users', icon: Users },
    { key: 'verification', label: 'Verification', path: '/admin/verification', icon: Shield },
    { key: 'publications', label: 'Publications', path: '/admin/publications', icon: FileCheck },
    { key: 'knowledge-base', label: 'Knowledge', path: '/admin/knowledge-base', icon: BookOpen },
    { key: 'specialties', label: 'Specialties', path: '/admin/specialties', icon: Target },
    { key: 'qualifications', label: 'Qualifications', path: '/admin/qualifications', icon: Award },
    { key: 'analytics', label: 'Analytics', path: '/admin/specialty-analytics', icon: BarChart3 },
    { key: 'feedback', label: 'Feedback', path: '/admin/feedback-builder', icon: MessageCircle },
    { key: 'cleanup', label: 'Cleanup', path: '/admin/data-cleanup', icon: Database },
    { key: 'templates', label: 'Templates', path: '/admin/templates', icon: FileText }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };


  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Header with navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <ProfileDropdown profile={{
                first_name: user.user_metadata?.first_name || 'Admin',
                last_name: user.user_metadata?.last_name || 'User',
                user_type: 'admin',
                email: user.email
              }} />
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="border-t">
            <nav className="flex space-x-1 py-2 overflow-x-auto">
              {navigationItems.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2 h-8"
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">
              Manage your fitness platform from this central dashboard
            </p>
          </div>

          {/* Alert Widgets */}
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-1">
                <SpecialtyRequestWidget />
              </div>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card>
            <CardContent className="p-6">
              <AdminAnalyticsDashboard onNavigate={(tab) => navigate(`/admin/${tab}`)} />
            </CardContent>
          </Card>

          {/* Live Activity Feed */}
          <Card>
            <CardContent className="p-6">
              <AdminLiveActivityFeed />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};