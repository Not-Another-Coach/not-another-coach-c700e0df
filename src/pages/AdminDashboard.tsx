import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserManagement } from '@/components/admin/UserManagement';
import { FeedbackQuestionBuilder } from '@/components/admin/FeedbackQuestionBuilder';
import { BulkUserUpload } from '@/components/admin/BulkUserUpload';
import { TestUserCleanup } from '@/components/admin/TestUserCleanup';
import { ClientTrainerCleanup } from '@/components/admin/ClientTrainerCleanup';
import { KnowledgeBaseAdmin } from '@/components/knowledge-base/KnowledgeBaseAdmin';
import { VisibilitySettingsSection } from '@/components/trainer-setup/VisibilitySettingsSection';
import { UserValidityChecker } from '@/components/admin/UserValidityChecker';
import { VerificationManagement } from '@/components/admin/VerificationManagement';
import { QualificationManagement } from '@/components/admin/QualificationManagement';
import { TemplateManagementTabs } from '@/components/coach/TemplateManagementTabs';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Settings, Users, Shield, BarChart3, Home, Eye, Upload, FileText, ExternalLink, CheckCircle, Trash2, Layout } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { useProfileByType } from '@/hooks/useProfileByType';

export const AdminDashboard = () => {
  const { isAdmin } = useUserRoles();
  const { user } = useAuth();
  const { profile } = useProfileByType();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string>('users');

  const adminSections = [
    {
      id: 'users',
      title: 'Users & Roles',
      description: 'Manage user accounts and permissions',
      icon: Users,
      color: 'from-blue-500/10 to-blue-600/10 border-blue-200'
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Handle trainer verification requests',
      icon: CheckCircle,
      color: 'from-green-500/10 to-green-600/10 border-green-200'
    },
    {
      id: 'bulk-upload',
      title: 'Bulk Upload',
      description: 'Upload multiple users and manage test data',
      icon: Upload,
      color: 'from-purple-500/10 to-purple-600/10 border-purple-200'
    },
    {
      id: 'feedback',
      title: 'Feedback Builder',
      description: 'Configure discovery call feedback questions',
      icon: Settings,
      color: 'from-amber-500/10 to-amber-600/10 border-amber-200'
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      description: 'Manage articles and documentation',
      icon: FileText,
      color: 'from-indigo-500/10 to-indigo-600/10 border-indigo-200'
    },
    {
      id: 'template-management',
      title: 'Template Management',
      description: 'Manage system activities and onboarding templates',
      icon: Layout,
      color: 'from-orange-500/10 to-orange-600/10 border-orange-200'
    },
    {
      id: 'visibility',
      title: 'Content Visibility',
      description: 'Control trainer content visibility settings',
      icon: Eye,
      color: 'from-cyan-500/10 to-cyan-600/10 border-cyan-200'
    },
    {
      id: 'cleanup',
      title: 'Data Cleanup',
      description: 'Clean up client-trainer interactions',
      icon: Trash2,
      color: 'from-red-500/10 to-red-600/10 border-red-200'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: BarChart3,
      color: 'from-emerald-500/10 to-emerald-600/10 border-emerald-200'
    },
    {
      id: 'qualifications',
      title: 'Qualifications',
      description: 'Manage popular qualifications and review requests',
      icon: FileText,
      color: 'from-teal-500/10 to-teal-600/10 border-teal-200'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System configuration and utilities',
      icon: Settings,
      color: 'from-gray-500/10 to-gray-600/10 border-gray-200'
    }
  ];

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'users':
        return <UserManagement />;
      case 'verification':
        return <VerificationManagement />;
      case 'bulk-upload':
        return (
          <div className="space-y-6">
            <BulkUserUpload />
            <TestUserCleanup />
          </div>
        );
      case 'cleanup':
        return <ClientTrainerCleanup />;
      case 'feedback':
        return <FeedbackQuestionBuilder />;
      case 'knowledge-base':
        return <KnowledgeBaseAdmin />;
      case 'template-management':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Template Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage system activities and onboarding templates for all trainers
              </p>
            </CardHeader>
            <CardContent>
              <TemplateManagementTabs />
            </CardContent>
          </Card>
        );
      case 'visibility':
        return (
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
        );
      case 'qualifications':
        return <QualificationManagement />;
      case 'analytics':
        return (
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
        );
      case 'settings':
        return (
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
        );
      default:
        return null;
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, roles, and system settings
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/documentation')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Documentation
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          {profile && (
            <ProfileDropdown profile={profile} />
          )}
        </div>
      </div>

      {/* Admin Section Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminSections.map((section) => {
          const IconComponent = section.icon;
          const isSelected = selectedSection === section.id;
          
          return (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 bg-gradient-to-br ${section.color} ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg transform scale-105' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedSection(section.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white/50 text-muted-foreground'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Section Content */}
      <div className="mt-8">
        {renderSectionContent()}
      </div>
    </div>
  );
};