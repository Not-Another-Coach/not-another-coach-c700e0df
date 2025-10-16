import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoManagement } from './LogoManagement';
import { SystemVisibilityDefaults } from './visibility/SystemVisibilityDefaults';
import { TrainerVisibilityManagement } from './visibility/TrainerVisibilityManagement';
import { VisibilityAnalytics } from './visibility/VisibilityAnalytics';
import { MembershipPlanManager } from './MembershipPlanManager';
import { TrainerMembershipAssignment } from './TrainerMembershipAssignment';
import { Settings, Image, Database, Users, CreditCard } from 'lucide-react';

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="membership" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plan Definitions
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Trainer Plans
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Visibility
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
        </TabsList>

      <TabsContent value="branding" className="space-y-6">
        <LogoManagement />
      </TabsContent>

      <TabsContent value="membership" className="space-y-6">
        <MembershipPlanManager />
      </TabsContent>

      <TabsContent value="assignments" className="space-y-6">
        <TrainerMembershipAssignment />
      </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <SystemVisibilityDefaults />
          <Card>
            <CardHeader>
              <CardTitle>Other General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Additional general application settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <VisibilityAnalytics />
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Additional database management tools will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <TrainerVisibilityManagement />
          <Card>
            <CardHeader>
              <CardTitle>Other User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Additional user management tools will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}