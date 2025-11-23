import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoManagement } from './LogoManagement';
import { SystemVisibilityDefaults } from './visibility/SystemVisibilityDefaults';
import { TrainerVisibilityManagement } from './visibility/TrainerVisibilityManagement';
import { VisibilityAnalytics } from './visibility/VisibilityAnalytics';
import { MembershipPlanManager } from './MembershipPlanManager';
import { TrainerMembershipAssignment } from './TrainerMembershipAssignment';
import { FailedPaymentConfigPanel } from './FailedPaymentConfigPanel';
import { PlanAnalytics } from './PlanAnalytics';
import { PlatformAccessControl } from './PlatformAccessControl';
import { Settings, Image, Database, Users, CreditCard, DollarSign, BarChart3, Shield } from 'lucide-react';

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="membership" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="payment-rules" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment Rules
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Access
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Visibility
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
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

      <TabsContent value="payment-rules" className="space-y-6">
        <FailedPaymentConfigPanel />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <PlanAnalytics />
      </TabsContent>

      <TabsContent value="access" className="space-y-6">
        <PlatformAccessControl />
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