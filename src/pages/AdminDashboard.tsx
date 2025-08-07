import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { FeedbackQuestionBuilder } from '@/components/admin/FeedbackQuestionBuilder';
import { BulkUserUpload } from '@/components/admin/BulkUserUpload';
import { TestUserCleanup } from '@/components/admin/TestUserCleanup';
import { KnowledgeBaseAdmin } from '@/components/knowledge-base/KnowledgeBaseAdmin';
import { VisibilitySettingsSection } from '@/components/trainer-setup/VisibilitySettingsSection';
import { UserValidityChecker } from '@/components/admin/UserValidityChecker';
import { Settings, Users, Shield, BarChart3, ArrowLeft, Home, Eye, Upload, FileText, ExternalLink } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

export const AdminDashboard = () => {
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have admin privileges to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/trainer/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, roles, and system settings
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/documentation')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Documentation
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="bulk-upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Feedback Builder
          </TabsTrigger>
          <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="visibility" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Content Visibility
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="bulk-upload">
            <div className="space-y-6">
              <BulkUserUpload />
              <TestUserCleanup />
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackQuestionBuilder />
          </TabsContent>

          <TabsContent value="knowledge-base">
            <KnowledgeBaseAdmin />
          </TabsContent>

        <TabsContent value="visibility">
          <Card>
            <CardHeader>
              <CardTitle>Content Visibility Matrix</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage how trainer content appears at different engagement stages
              </p>
            </CardHeader>
            <CardContent>
              <VisibilitySettingsSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <UserValidityChecker />
            
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Additional system settings coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};