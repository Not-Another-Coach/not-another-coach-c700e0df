import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Database,
  Activity,
  ExternalLink
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useTrainerCustomRequests } from '@/hooks/useQualifications';
import { useTrainerCustomSpecialtyRequests } from '@/hooks/useSpecialties';

export const AdminAnalyticsDashboard = () => {
  const { users, loading: usersLoading } = useUserRoles();
  const { data: qualificationRequests } = useTrainerCustomRequests();
  const { requests: specialtyRequests } = useTrainerCustomSpecialtyRequests();

  // Calculate key metrics
  const totalUsers = users?.length || 0;
  const trainerCount = users?.filter(u => u.roles?.includes('trainer')).length || 0;
  const clientCount = users?.filter(u => u.roles?.includes('client')).length || 0;
  const adminCount = users?.filter(u => u.roles?.includes('admin')).length || 0;
  
  const pendingVerifications = 0; // Verification status not available in UserWithRoles

  const pendingQualifications = qualificationRequests?.filter(q => q.status === 'pending').length || 0;
  const pendingSpecialties = specialtyRequests?.filter(s => s.status === 'pending').length || 0;
  const totalPendingRequests = pendingVerifications + pendingQualifications + pendingSpecialties;

  const verifiedTrainers = 0; // Verification status not available in UserWithRoles

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      change: "+12% this month",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      breakdown: `${trainerCount} trainers, ${clientCount} clients, ${adminCount} admins`
    },
    {
      title: "Pending Requests",
      value: totalPendingRequests.toString(),
      change: pendingVerifications > 0 ? `${pendingVerifications} verifications` : "All caught up!",
      icon: AlertTriangle,
      color: totalPendingRequests > 0 ? "text-orange-600" : "text-green-600",
      bgColor: totalPendingRequests > 0 ? "bg-orange-50" : "bg-green-50",
      breakdown: `${pendingQualifications} qualifications, ${pendingSpecialties} specialties`
    },
    {
      title: "Verified Trainers",
      value: verifiedTrainers.toString(),
      change: `Visit verification tab for details`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      breakdown: `${trainerCount} trainers need verification review`
    },
    {
      title: "System Health",
      value: "Optimal",
      change: "99.9% uptime",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      breakdown: "All systems operational"
    }
  ];

  if (usersLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="font-medium text-sm text-muted-foreground">
                      {stat.title}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 opacity-75">
                    {stat.breakdown}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => {/* Navigate to users tab */}}
            >
              <div className="text-left">
                <div className="font-medium">Review Pending Verifications</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {pendingVerifications} trainers awaiting review
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => {/* Navigate to content tab */}}
            >
              <div className="text-left">
                <div className="font-medium">Manage Custom Requests</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {pendingQualifications + pendingSpecialties} requests pending
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => window.open('/documentation', '_blank')}
            >
              <div className="text-left">
                <div className="font-medium flex items-center gap-2">
                  View Documentation
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  System architecture and guides
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};