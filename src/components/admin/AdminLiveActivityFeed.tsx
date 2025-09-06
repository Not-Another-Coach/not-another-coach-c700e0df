import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Shield, UserCheck, FileText, Target, AlertTriangle } from 'lucide-react';
import { useTrainerCustomRequests } from '@/hooks/useQualifications';
import { useTrainerCustomSpecialtyRequests } from '@/hooks/useSpecialties';
import { useUserRoles } from '@/hooks/useUserRoles';
import { format } from 'date-fns';

export const AdminLiveActivityFeed = () => {
  const { data: qualificationRequests } = useTrainerCustomRequests();
  const { requests: specialtyRequests } = useTrainerCustomSpecialtyRequests();
  const { users } = useUserRoles();

  // Create admin-focused activity feed
  const createAdminActivities = () => {
    const activities: any[] = [];

    // Add recent user registrations (last 24 hours)
    if (users) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      users
        .filter(user => new Date(user.created_at) > oneDayAgo)
        .forEach(user => {
          const userType = user.roles?.[0] || 'user';
          activities.push({
            id: `user-${user.id}`,
            title: `New ${userType} registered`,
            description: `${user.first_name || 'User'} ${user.last_name || ''} joined the platform`.trim(),
            icon: '👤',
            color: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200',
            created_at: user.created_at,
            type: 'user_registration'
          });
        });
    }

    // Add pending qualification requests
    if (qualificationRequests) {
      qualificationRequests
        .filter(req => req.status === 'pending')
        .forEach(req => {
          activities.push({
            id: `qual-pending-${req.id}`,
            title: `New qualification request`,
            description: `"${req.qualification_name}" awaiting review`,
            icon: '📋',
            color: 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200',
            created_at: req.created_at,
            type: 'qualification_request',
            priority: 'high'
          });
        });

      // Add recent qualification updates
      qualificationRequests
        .filter(req => req.status !== 'pending')
        .slice(0, 3)
        .forEach(req => {
          activities.push({
            id: `qual-${req.id}`,
            title: `Qualification ${req.status}`,
            description: `"${req.qualification_name}" was ${req.status}`,
            icon: req.status === 'approved' ? '✅' : '❌',
            color: req.status === 'approved' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200',
            created_at: req.updated_at || req.created_at,
            type: 'qualification_update'
          });
        });
    }

    // Add pending specialty requests
    if (specialtyRequests) {
      specialtyRequests
        .filter(req => req.status === 'pending')
        .forEach(req => {
          activities.push({
            id: `spec-pending-${req.id}`,
            title: `New specialty request`,
            description: `"${req.requested_name}" awaiting review`,
            icon: '🎯',
            color: 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200',
            created_at: req.created_at,
            type: 'specialty_request',
            priority: 'high'
          });
        });

      // Add recent specialty updates
      specialtyRequests
        .filter(req => req.status !== 'pending')
        .slice(0, 3)
        .forEach(req => {
          activities.push({
            id: `spec-${req.id}`,
            title: `Specialty ${req.status}`,
            description: `"${req.requested_name}" was ${req.status}`,
            icon: req.status === 'approved' ? '✅' : '❌',
            color: req.status === 'approved' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200',
            created_at: req.updated_at || req.created_at,
            type: 'specialty_update'
          });
        });
    }

    // Add system health notifications (simulated)
    const systemActivities = [
      {
        id: 'system-backup',
        title: 'Daily backup completed',
        description: 'All data successfully backed up',
        icon: '💾',
        color: 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200',
        created_at: new Date().toISOString(),
        type: 'system'
      }
    ];

    activities.push(...systemActivities);

    // Sort by created_at descending, with priority items first
    return activities.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const adminActivities = createAdminActivities();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Activity Feed
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {adminActivities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent admin activity</p>
          </div>
        ) : (
          adminActivities.slice(0, 10).map((activity) => (
            <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg ${activity.color}`}>
              <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm mt-1 opacity-75">{activity.description}</p>
                  </div>
                  {activity.priority === 'high' && (
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 ml-2" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {format(new Date(activity.created_at), 'h:mm a')}
                  </Badge>
                  {activity.type === 'qualification_request' && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Qualification
                    </Badge>
                  )}
                  {activity.type === 'specialty_request' && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      Specialty
                    </Badge>
                  )}
                  {activity.type === 'user_registration' && (
                    <Badge variant="outline" className="text-xs">
                      <UserCheck className="w-3 h-3 mr-1" />
                      New User
                    </Badge>
                  )}
                  {activity.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      Action Required
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};