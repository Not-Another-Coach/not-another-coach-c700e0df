import { Card } from '@/components/ui/card';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export function DemoOnboardingSummary() {
  const metrics = [
    {
      label: 'Total Clients',
      value: '12',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Completed',
      value: '8',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'In Progress',
      value: '4',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Avg Completion',
      value: '67%',
      icon: TrendingUp,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Client Onboarding Summary</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="text-center">
              <div className={`inline-flex p-3 rounded-lg ${metric.bgColor} mb-2`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
