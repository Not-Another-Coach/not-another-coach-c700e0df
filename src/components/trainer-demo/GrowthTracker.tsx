import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Star, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function GrowthTracker() {
  const metrics = [
    {
      title: 'Clients This Week',
      value: '8',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      progress: 80,
      change: '+2 this week',
    },
    {
      title: 'Sessions Booked',
      value: '12',
      icon: Calendar,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      progress: 75,
      change: '+4 this week',
    },
    {
      title: 'Average Rating',
      value: '4.9',
      icon: Star,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      progress: 98,
      change: 'Excellent',
    },
    {
      title: 'Monthly Growth',
      value: '+23%',
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20',
      progress: 65,
      change: 'Above average',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Growth Tracker
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your coaching business performance
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${metric.borderColor} ${metric.bgColor} transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg bg-card ${metric.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {metric.title}
                  </div>
                </div>
                <div className={`text-2xl font-bold mb-2 ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="space-y-2">
                  <Progress value={metric.progress} className="h-1.5" />
                  <div className="text-xs text-muted-foreground">
                    {metric.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Total Earnings This Month</div>
              <div className="text-2xl font-bold text-primary">£2,850</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">vs last month</div>
              <div className="text-sm font-semibold text-success">+18%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
