import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminLiveActivityFeed } from "@/components/admin/AdminLiveActivityFeed";
import { QualificationRequestWidget } from "@/components/alerts/QualificationRequestAlerts";
import { SpecialtyRequestWidget } from "@/components/alerts/SpecialtyRequestAlerts";
import { 
  Users, 
  Upload, 
  Shield, 
  FileCheck, 
  BookOpen, 
  Target, 
  Award, 
  BarChart3, 
  FileBarChart, 
  MessageCircle, 
  Database, 
  FileText,
  ArrowRight,
  User
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

  const adminFunctions = [
    // Users & Access
    { 
      title: "User Management", 
      description: "Manage users, roles, and permissions", 
      icon: Users,
      path: "/admin/users",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    { 
      title: "Bulk User Upload", 
      description: "Import users in bulk from CSV files", 
      icon: Upload,
      path: "/admin/bulk-upload", 
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    { 
      title: "Verification System", 
      description: "Manage trainer verification requests", 
      icon: Shield,
      path: "/admin/verification",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    },
    { 
      title: "Profile Publications", 
      description: "Review and approve profile publication requests", 
      icon: FileCheck,
      path: "/admin/publications",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
    },
    
    // Content Management
    { 
      title: "Knowledge Base", 
      description: "Manage articles and categories", 
      icon: BookOpen,
      path: "/admin/knowledge-base",
      color: "bg-teal-50 border-teal-200 hover:bg-teal-100"
    },
    { 
      title: "Specialties & Training", 
      description: "Manage specialty categories", 
      icon: Target,
      path: "/admin/specialties",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
    },
    { 
      title: "Qualifications", 
      description: "Manage certification categories", 
      icon: Award,
      path: "/admin/qualifications",
      color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
    },
    
    // Analytics
    { 
      title: "Specialty Analytics", 
      description: "View specialty performance data", 
      icon: BarChart3,
      path: "/admin/specialty-analytics",
      color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100"
    },
    { 
      title: "Verification Analytics", 
      description: "Monitor verification trends", 
      icon: FileBarChart,
      path: "/admin/verification-analytics",
      color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
    },
    
    // System Tools
    { 
      title: "Feedback Builder", 
      description: "Create discovery call questions", 
      icon: MessageCircle,
      path: "/admin/feedback-builder",
      color: "bg-pink-50 border-pink-200 hover:bg-pink-100"
    },
    { 
      title: "Data Cleanup Tools", 
      description: "Clean up test data and interactions", 
      icon: Database,
      path: "/admin/data-cleanup",
      color: "bg-red-50 border-red-200 hover:bg-red-100"
    },
    { 
      title: "Template Management", 
      description: "Manage onboarding templates", 
      icon: FileText,
      path: "/admin/templates",
      color: "bg-violet-50 border-violet-200 hover:bg-violet-100"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Header with navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                System Administrator
              </Badge>
              <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Platform Management</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/trainer-dashboard')}>
                <User className="h-4 w-4 mr-2" />
                Trainer View
              </Button>
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
          <div className="grid gap-4 md:grid-cols-2">
            <QualificationRequestWidget />
            <SpecialtyRequestWidget />
          </div>

          {/* Analytics Dashboard */}
          <AdminAnalyticsDashboard />

          {/* Admin Functions Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {adminFunctions.map((func, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-all duration-200">
                  <CardContent 
                    className="p-4 flex flex-col items-center text-center space-y-3"
                    onClick={() => navigate(func.path)}
                  >
                    <div className="p-3 rounded-full bg-primary/10">
                      <func.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{func.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{func.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <AdminLiveActivityFeed />
        </div>
      </main>
    </div>
  );
};