import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp } from 'lucide-react';
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-4 w-4 text-primary" />
          Your Growth Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${metric.borderColor} ${metric.bgColor} transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`p-1.5 rounded-lg bg-card ${metric.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {metric.title}
                  </div>
                </div>
                <div className={`text-xl font-bold mb-1.5 ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="space-y-1.5">
                  <Progress value={metric.progress} className="h-1" />
                  <div className="text-xs text-muted-foreground">
                    {metric.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium">Total Earnings This Month</div>
              <div className="text-xl font-bold text-primary">£2,850</div>
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
