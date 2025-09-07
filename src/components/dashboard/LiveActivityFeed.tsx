import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, CheckCircle, XCircle, FileText, Target, AlertTriangle, Clock } from 'lucide-react';
import { useActivityAlerts } from '@/hooks/useActivityAlerts';
import { useTrainerStreak } from '@/hooks/useTrainerStreak';
import { useTrainerCustomRequests } from '@/hooks/useQualifications';
import { useTrainerCustomSpecialtyRequests } from '@/hooks/useSpecialties';
import { useAuth } from '@/hooks/useAuth';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { format } from 'date-fns';

export const LiveActivityFeed = () => {
  const { alerts, loading } = useActivityAlerts();
  const { streakCount, loading: streakLoading } = useTrainerStreak();
  const { data: qualificationRequests } = useTrainerCustomRequests();
  const { requests: specialtyRequests } = useTrainerCustomSpecialtyRequests();
  const { user } = useAuth();
  const { isTrainer } = useUserTypeChecks();

  // Create combined activity feed including qualifications, specialties and verification notifications
  const createCombinedActivities = () => {
    const activities: any[] = [];

    // Add regular alerts (excluding verification ones as we'll format them specially)
    const regularAlerts = alerts.filter(alert => 
      !['verification_check_update', 'verification_expiry_warning', 'verification_expired'].includes(alert.type)
    );
    activities.push(...regularAlerts);

    // Add verification alerts with special formatting
    const verificationAlerts = alerts.filter(alert => 
      ['verification_check_update', 'verification_expiry_warning', 'verification_expired'].includes(alert.type)
    ).map(alert => ({
      ...alert,
      icon: getVerificationIcon(alert),
      color: getVerificationColor(alert),
      type: 'verification',
      customType: true
    }));
    activities.push(...verificationAlerts);

    // Add qualification notifications
    if (qualificationRequests) {
      qualificationRequests
        .filter(req => req.status !== 'pending')
        .forEach(req => {
          const updatedAt = new Date(req.updated_at || req.created_at);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          
          if (updatedAt > threeDaysAgo) {
            activities.push({
              id: `qual-${req.id}`,
              title: req.status === 'approved' 
                ? `Qualification "${req.qualification_name}" approved`
                : `Qualification "${req.qualification_name}" rejected`,
              description: req.admin_notes || (req.status === 'approved' 
                ? 'Your custom qualification has been approved by admin'
                : 'Please contact support if you have questions'),
              icon: req.status === 'approved' ? '✅' : '❌',
              color: req.status === 'approved' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200',
              created_at: req.updated_at || req.created_at,
              type: 'qualification',
              customType: true
            });
          }
        });
    }

    // Add specialty notifications
    if (specialtyRequests) {
      specialtyRequests
        .filter(req => req.status !== 'pending')
        .forEach(req => {
          const updatedAt = new Date(req.updated_at || req.created_at);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          
          if (updatedAt > threeDaysAgo) {
            activities.push({
              id: `spec-${req.id}`,
              title: req.status === 'approved' 
                ? `Specialty "${req.requested_name}" approved`
                : `Specialty "${req.requested_name}" rejected`,
              description: req.admin_notes || (req.status === 'approved' 
                ? 'Your custom specialty has been approved by admin'
                : 'Please contact support if you have questions'),
              icon: req.status === 'approved' ? '✅' : '❌',
              color: req.status === 'approved' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200',
              created_at: req.updated_at || req.created_at,
              type: 'specialty',
              customType: true
            });
          }
        });
    }

    // Sort by created_at descending
    return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Helper functions for verification alerts
  const getVerificationIcon = (alert: any) => {
    if (alert.type === 'verification_check_update') {
      if (alert.metadata?.status === 'verified') return '✅';
      if (alert.metadata?.status === 'rejected') return '❌';
      return '⏳';
    }
    if (alert.type === 'verification_expiry_warning') return '⚠️';
    if (alert.type === 'verification_expired') return '🔴';
    return '📄';
  };

  const getVerificationColor = (alert: any) => {
    if (alert.type === 'verification_check_update') {
      if (alert.metadata?.status === 'verified') {
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200';
      }
      if (alert.metadata?.status === 'rejected') {
        return 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200';
      }
      return 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200';
    }
    if (alert.type === 'verification_expiry_warning') {
      return 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200';
    }
    if (alert.type === 'verification_expired') {
      return 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200';
    }
    return 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200';
  };

  const combinedActivities = createCombinedActivities();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Activity</CardTitle>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
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
          <CardTitle className="text-lg">Live Activity</CardTitle>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {/* 3 Week Streak Achievement - Only show for trainers with streak >= 3 */}
        {isTrainer() && !streakLoading && streakCount >= 3 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white">
              🔥
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800">{streakCount} Week Streak!</p>
              <p className="text-sm mt-1 text-green-600">You've updated your profile {streakCount} weeks in a row</p>
              <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                Achievement Unlocked
              </Badge>
            </div>
          </div>
        )}

        {/* Regular activity alerts including qualifications and specialties */}
        {combinedActivities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent activity</p>
          </div>
        ) : (
          combinedActivities.map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.color}`}>
              <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm mt-1 opacity-75">{alert.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {format(new Date(alert.created_at), 'h:mm a')}
                  </Badge>
                  {(alert as any).customType && (alert as any).type === 'qualification' && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Qualification
                    </Badge>
                  )}
                  {(alert as any).customType && (alert as any).type === 'specialty' && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      Specialty
                    </Badge>
                  )}
                  {(alert as any).customType && (alert as any).type === 'verification' && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Verification
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