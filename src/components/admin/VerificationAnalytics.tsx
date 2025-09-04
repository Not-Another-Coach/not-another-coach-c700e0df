import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  FileCheck,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';

interface VerificationStats {
  total_trainers: number;
  verified_trainers: number;
  pending_checks: number;
  rejected_checks: number;
  expired_checks: number;
  verification_rate: number;
  avg_review_time_hours: number;
  checks_by_type: {
    check_type: string;
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    expired: number;
  }[];
  recent_activity: {
    date: string;
    submissions: number;
    approvals: number;
    rejections: number;
  }[];
}

export const VerificationAnalytics = () => {
  const { isAdmin } = useUserRoles();
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      // Get trainer counts
      const { data: trainers } = await supabase
        .from('profiles')
        .select('id, verification_status')
        .eq('user_type', 'trainer');

      // Get verification checks
      const { data: checks } = await supabase
        .from('trainer_verification_checks')
        .select('check_type, status, created_at, verified_at');

      // Get recent activity from audit log
      const { data: auditLog } = await supabase
        .from('trainer_verification_audit_log')
        .select('action, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (trainers && checks) {
        const verifiedTrainers = trainers.filter(t => t.verification_status === 'verified').length;
        const totalTrainers = trainers.length;

        const pendingChecks = checks.filter(c => c.status === 'pending').length;
        const rejectedChecks = checks.filter(c => c.status === 'rejected').length;
        const expiredChecks = checks.filter(c => c.status === 'expired').length;

        // Calculate average review time
        const reviewedChecks = checks.filter(c => c.verified_at && c.created_at);
        const avgReviewTime = reviewedChecks.length > 0 
          ? reviewedChecks.reduce((acc, check) => {
              const created = new Date(check.created_at);
              const verified = new Date(check.verified_at!);
              return acc + (verified.getTime() - created.getTime());
            }, 0) / reviewedChecks.length / (1000 * 60 * 60) // Convert to hours
          : 0;

        // Group by check type
        const checksByType = checks.reduce((acc, check) => {
          const existing = acc.find(item => item.check_type === check.check_type);
          if (existing) {
            existing.total++;
            existing[check.status]++;
          } else {
            acc.push({
              check_type: check.check_type,
              total: 1,
              verified: check.status === 'verified' ? 1 : 0,
              pending: check.status === 'pending' ? 1 : 0,
              rejected: check.status === 'rejected' ? 1 : 0,
              expired: check.status === 'expired' ? 1 : 0,
            });
          }
          return acc;
        }, [] as any[]);

        // Recent activity by day
        const recentActivity = auditLog?.reduce((acc, log) => {
          const date = new Date(log.created_at).toISOString().split('T')[0];
          const existing = acc.find(item => item.date === date);
          
          if (existing) {
            if (log.action === 'upload') existing.submissions++;
            if (log.action === 'verify') existing.approvals++;
            if (log.action === 'reject') existing.rejections++;
          } else {
            acc.push({
              date,
              submissions: log.action === 'upload' ? 1 : 0,
              approvals: log.action === 'verify' ? 1 : 0,
              rejections: log.action === 'reject' ? 1 : 0,
            });
          }
          return acc;
        }, [] as any[]) || [];

        setStats({
          total_trainers: totalTrainers,
          verified_trainers: verifiedTrainers,
          pending_checks: pendingChecks,
          rejected_checks: rejectedChecks,
          expired_checks: expiredChecks,
          verification_rate: totalTrainers > 0 ? (verifiedTrainers / totalTrainers) * 100 : 0,
          avg_review_time_hours: avgReviewTime,
          checks_by_type: checksByType,
          recent_activity: recentActivity.slice(0, 7).reverse(),
        });
      }
    } catch (error) {
      console.error('Error fetching verification analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!stats) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
                <p className="text-2xl font-bold">{stats.total_trainers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{stats.verified_trainers}</p>
                <p className="text-xs text-green-600">
                  {stats.verification_rate.toFixed(1)}% rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending_checks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Review Time</p>
                <p className="text-2xl font-bold">{Math.round(stats.avg_review_time_hours)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="by-type" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-type">By Check Type</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="by-type">
          <Card>
            <CardHeader>
              <CardTitle>Verification Checks by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.checks_by_type.map((checkType) => (
                  <div key={checkType.check_type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">
                        {checkType.check_type.replace('_', ' ')}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {checkType.total} total
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified: {checkType.verified}
                      </Badge>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Pending: {checkType.pending}
                      </Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Rejected: {checkType.rejected}
                      </Badge>
                      {checkType.expired > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Expired: {checkType.expired}
                        </Badge>
                      )}
                    </div>
                    <Progress 
                      value={(checkType.verified / checkType.total) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recent_activity.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{day.date}</span>
                    <div className="flex gap-3 text-sm">
                      <span className="text-blue-600">
                        <FileCheck className="h-4 w-4 inline mr-1" />
                        {day.submissions} submitted
                      </span>
                      <span className="text-green-600">
                        <CheckCircle2 className="h-4 w-4 inline mr-1" />
                        {day.approvals} approved
                      </span>
                      <span className="text-red-600">
                        <XCircle className="h-4 w-4 inline mr-1" />
                        {day.rejections} rejected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};