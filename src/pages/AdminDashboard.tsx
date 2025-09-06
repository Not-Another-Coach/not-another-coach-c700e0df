import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/AdminHeader";
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
  ArrowRight
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
    <div className="min-h-screen bg-background">
      <AdminHeader 
        profile={{
          ...user,
          user_type: 'admin'
        }}
        showNavigation={false}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your platform with comprehensive administrative tools
            </p>
          </div>

          {/* Alert components for pending requests */}
          <div className="space-y-4">
            <QualificationRequestWidget />
            <SpecialtyRequestWidget />
          </div>
          
          {/* Stats Dashboard */}
          <AdminAnalyticsDashboard onNavigate={() => {}} />
          
          {/* Admin Functions Grid */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Administrative Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminFunctions.map((func) => {
                const Icon = func.icon;
                return (
                  <Card 
                    key={func.path}
                    className={`cursor-pointer transition-all duration-200 ${func.color}`}
                    onClick={() => navigate(func.path)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Icon className="w-6 h-6 text-primary" />
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{func.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{func.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Live Activity Feed */}
          <AdminLiveActivityFeed />
        </div>
      </div>
    </div>
  );
};