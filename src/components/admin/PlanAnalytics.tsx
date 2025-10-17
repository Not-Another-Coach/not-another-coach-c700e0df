import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, DollarSign, TrendingDown, Wallet } from 'lucide-react';

interface AnalyticsData {
  totalActiveTrainers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  avgRevenuePerTrainer: number;
  planDistribution: Record<string, number>;
  gracePeriodCount: number;
  limitedModeCount: number;
}

export const PlanAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalActiveTrainers: 0,
    monthlyRecurringRevenue: 0,
    churnRate: 0,
    avgRevenuePerTrainer: 0,
    planDistribution: {},
    gracePeriodCount: 0,
    limitedModeCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Total active trainers
      const { count: totalActive } = await supabase
        .from('trainer_membership')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // MRR calculation
      const { data: memberships } = await supabase
        .from('trainer_membership')
        .select('monthly_price_cents')
        .eq('is_active', true);

      const mrr = (memberships || []).reduce((sum, m) => sum + (m.monthly_price_cents || 0), 0) / 100;

      // Plan distribution
      const { data: planDist } = await supabase
        .from('trainer_membership')
        .select('plan_type')
        .eq('is_active', true);

      const distribution = (planDist || []).reduce((acc: Record<string, number>, curr) => {
        acc[curr.plan_type] = (acc[curr.plan_type] || 0) + 1;
        return acc;
      }, {});

      // Grace period count
      const { count: graceCount } = await supabase
        .from('trainer_membership')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'past_due');

      // Limited mode count
      const { count: limitedCount } = await supabase
        .from('trainer_membership')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'limited_mode');

      setData({
        totalActiveTrainers: totalActive || 0,
        monthlyRecurringRevenue: mrr,
        churnRate: 0, // Would need historical data
        avgRevenuePerTrainer: totalActive ? mrr / totalActive : 0,
        planDistribution: distribution,
        gracePeriodCount: graceCount || 0,
        limitedModeCount: limitedCount || 0
      });
    } catch (error: any) {
      toast.error('Failed to load analytics', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(cents);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalActiveTrainers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.monthlyRecurringRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue Per Trainer</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.avgRevenuePerTrainer)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.churnRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>Active trainers by plan type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.planDistribution).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{plan} Plan</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(count / data.totalActiveTrainers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {count} ({((count / data.totalActiveTrainers) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Health */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Health</CardTitle>
          <CardDescription>Trainers with payment issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{data.gracePeriodCount}</div>
              <div className="text-sm text-muted-foreground">In Grace Period</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{data.limitedModeCount}</div>
              <div className="text-sm text-muted-foreground">Limited Mode</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
