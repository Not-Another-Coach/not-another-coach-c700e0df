import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminLiveActivityFeed } from "@/components/admin/AdminLiveActivityFeed";

// Import admin components
import { UserManagement } from "@/components/admin/UserManagement";
import { BulkUserUpload } from "@/components/admin/BulkUserUpload";
import { VerificationManagement } from "@/components/admin/VerificationManagement";
import { KnowledgeBaseAdmin } from "@/components/knowledge-base/KnowledgeBaseAdmin";
import { SpecialtyManagement } from "@/components/admin/SpecialtyManagement";
import { QualificationManagement } from "@/components/admin/QualificationManagement";
import { FeedbackQuestionBuilder } from "@/components/admin/FeedbackQuestionBuilder";
import { SpecialtyAnalyticsDashboard } from "@/components/admin/SpecialtyAnalyticsDashboard";
import { VerificationAnalytics } from "@/components/admin/VerificationAnalytics";
import { ClientTrainerCleanup } from "@/components/admin/ClientTrainerCleanup";
import { TestUserCleanup } from "@/components/admin/TestUserCleanup";
import TemplateSectionsManagement from "@/components/admin/TemplateSectionsManagement";
import { EnhancedVerificationManagement } from "@/components/admin/EnhancedVerificationManagement";
import { QualificationRequestWidget } from "@/components/alerts/QualificationRequestAlerts";
import { SpecialtyRequestWidget } from "@/components/alerts/SpecialtyRequestAlerts";
import { ProfilePublicationManagement } from "@/components/admin/ProfilePublicationManagement";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [usersSubTab, setUsersSubTab] = useState("user-management");

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AdminHeader 
        profile={{
          ...user,
          user_type: 'admin'
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Alert components for pending requests */}
              <div className="space-y-4">
                <QualificationRequestWidget />
                <SpecialtyRequestWidget />
              </div>
              
              {/* Stats Dashboard */}
              <AdminAnalyticsDashboard onNavigate={setActiveTab} />
              
              {/* Live Activity Feed */}
              <AdminLiveActivityFeed />
            </div>
          )}

          {/* Users & Access Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    usersSubTab === "user-management" ? "bg-blue-100 border-blue-300" : "bg-blue-50 border-blue-200"
                  }`}
                  onClick={() => setUsersSubTab("user-management")}
                >
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    usersSubTab === "bulk-upload" ? "bg-green-100 border-green-300" : "bg-green-50 border-green-200"
                  }`}
                  onClick={() => setUsersSubTab("bulk-upload")}
                >
                  <CardHeader>
                    <CardTitle>Bulk User Upload</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Import users in bulk from CSV files</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    usersSubTab === "verification" ? "bg-purple-100 border-purple-300" : "bg-purple-50 border-purple-200"
                  }`}
                  onClick={() => setUsersSubTab("verification")}
                >
                  <CardHeader>
                    <CardTitle>Verification System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Manage trainer verification requests</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    usersSubTab === "publications" ? "bg-indigo-100 border-indigo-300" : "bg-indigo-50 border-indigo-200"
                  }`}
                  onClick={() => setUsersSubTab("publications")}
                >
                  <CardHeader>
                    <CardTitle>Profile Publications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Review and approve profile publication requests</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sub-tab content */}
              <Card>
                <CardContent className="p-6">
                  {usersSubTab === "user-management" && <UserManagement />}
                  {usersSubTab === "bulk-upload" && <BulkUserUpload />}
                  {usersSubTab === "verification" && <EnhancedVerificationManagement />}
                  {usersSubTab === "publications" && <ProfilePublicationManagement />}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Management Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-indigo-50 border-indigo-200">
                  <CardHeader>
                    <CardTitle>Knowledge Base</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Manage articles and categories</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-orange-50 border-orange-200">
                  <CardHeader>
                    <CardTitle>Specialties & Training</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Manage specialty categories</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle>Qualifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Manage certification categories</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Default to Knowledge Base */}
              <Card>
                <CardContent className="p-6">
                  <KnowledgeBaseAdmin />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data & Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-cyan-50 border-cyan-200">
                  <CardHeader>
                    <CardTitle>Specialty Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">View specialty performance data</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-emerald-50 border-emerald-200">
                  <CardHeader>
                    <CardTitle>Verification Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Monitor verification trends</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Default to Specialty Analytics */}
              <Card>
                <CardContent className="p-6">
                  <SpecialtyAnalyticsDashboard />
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-pink-50 border-pink-200">
                  <CardHeader>
                    <CardTitle>Feedback Builder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Create discovery call questions</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle>Data Cleanup Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Clean up test data and interactions</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-teal-50 border-teal-200">
                  <CardHeader>
                    <CardTitle>Template Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Manage onboarding templates</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Default to Feedback Builder */}
              <Card>
                <CardContent className="p-6">
                  <FeedbackQuestionBuilder />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};