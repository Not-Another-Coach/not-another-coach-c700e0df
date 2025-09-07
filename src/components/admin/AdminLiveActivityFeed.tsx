import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Plus, MessageSquare, UserPlus, FileText, Settings, CheckCircle, XCircle, Target, Users, FileCheck } from 'lucide-react';
import { useTrainerCustomRequests } from '@/hooks/useQualifications';
import { useTrainerCustomSpecialtyRequests } from '@/hooks/useSpecialties';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useTrainerVerification } from '@/hooks/useTrainerVerification';
import { useAdminProfilePublication } from '@/hooks/useProfilePublication';
import { format, isToday, isYesterday, subDays } from 'date-fns';

export const AdminLiveActivityFeed = () => {
  const { data: qualificationRequests } = useTrainerCustomRequests();
  const { requests: specialtyRequests } = useTrainerCustomSpecialtyRequests();
  const { users, loading: usersLoading } = useUserRoles();
  const { verificationRequests } = useTrainerVerification();
  const { requests: publicationRequests } = useAdminProfilePublication();

  const createAdminActivities = () => {
    const activities: any[] = [];

    // Add recent user registrations (last 7 days)
    if (users) {
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const recentUsers = users.filter(user => 
        new Date(user.created_at) > sevenDaysAgo
      );

      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          title: 'New User Registration',
          description: `${user.first_name || 'User'} ${user.last_name || ''} joined as ${user.user_type}`,
          icon: <UserPlus className="h-4 w-4" />,
          color: 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200',
          created_at: user.created_at,
          type: 'user_registration',
          priority: user.user_type === 'trainer' ? 'high' : 'normal'
        });
      });
    }

    // Add qualification requests (only pending - admin action required)
    if (qualificationRequests) {
      const pendingQualifications = qualificationRequests.filter(req => 
        req.status === 'pending' && 
        new Date(req.created_at) > subDays(new Date(), 7)
      );

      pendingQualifications.forEach(req => {
        activities.push({
          id: `qual-${req.id}`,
          title: 'New Qualification Request',
          description: `${req.qualification_name} - Requires admin review`,
          icon: <FileText className="h-4 w-4" />,
          color: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200',
          created_at: req.created_at,
          type: 'qualification',
          priority: 'high'
        });
      });
    }

    // Add specialty requests (only pending - admin action required)
    if (specialtyRequests) {
      const pendingSpecialties = specialtyRequests.filter(req => 
        req.status === 'pending' && 
        new Date(req.created_at) > subDays(new Date(), 7)
      );

      pendingSpecialties.forEach(req => {
        activities.push({
          id: `spec-${req.id}`,
          title: 'New Specialty Request',
          description: `${req.requested_name} - Requires admin review`,
          icon: <Target className="h-4 w-4" />,
          color: 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200',
          created_at: req.created_at,
          type: 'specialty',
          priority: 'high'
        });
      });
    }

    // Add verification requests (only pending - admin action required)
    if (verificationRequests) {
      const pendingVerifications = verificationRequests.filter(req => 
        req.status === 'pending' && 
        new Date(req.created_at || req.submitted_at) > subDays(new Date(), 7)
      );

      pendingVerifications.forEach(req => {
        activities.push({
          id: `verify-${req.id}`,
          title: 'New Verification Request',
          description: `Trainer verification - Requires admin review`,
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200',
          created_at: req.created_at || req.submitted_at,
          type: 'verification',
          priority: 'high'
        });
      });
    }

    // Add profile publication requests (only pending - admin action required)
    if (publicationRequests) {
      const pendingPublications = publicationRequests.filter(req => 
        req.status === 'pending' && 
        new Date(req.created_at || req.requested_at) > subDays(new Date(), 7)
      );

      pendingPublications.forEach(req => {
        activities.push({
          id: `pub-${req.id}`,
          title: 'New Profile Publication Request',
          description: `Trainer profile publication - Requires admin review`,
          icon: <FileCheck className="h-4 w-4" />,
          color: 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200',
          created_at: req.created_at || req.requested_at,
          type: 'publication',
          priority: 'high'
        });
      });
    }

    // Sort by priority (high first) then by date (newest first)
    return activities
      .sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 10); // Show latest 10 activities
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const adminActivities = createAdminActivities();

  if (usersLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Admin Activity Feed</CardTitle>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Admin Activity Feed</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Pending Actions Only
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {adminActivities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No pending admin requests</p>
          </div>
        ) : (
          adminActivities.map((activity) => (
            <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg ${activity.color}`}>
              <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm mt-1 opacity-75">{activity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatRelativeTime(activity.created_at)}
                  </Badge>
                  {activity.type === 'qualification' && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Qualification
                    </Badge>
                  )}
                  {activity.type === 'specialty' && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      Specialty
                    </Badge>
                  )}
                  {activity.type === 'user_registration' && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      New User
                    </Badge>
                  )}
                  {activity.type === 'publication' && (
                    <Badge variant="outline" className="text-xs">
                      <FileCheck className="w-3 h-3 mr-1" />
                      Publication
                    </Badge>
                  )}
                  {activity.type === 'verification' && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verification
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