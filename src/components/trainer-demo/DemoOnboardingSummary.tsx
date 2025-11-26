import { Card } from '@/components/ui/card';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export function DemoOnboardingSummary() {
  const metrics = [
    {
      label: 'Total Clients',
      value: '12',
      icon: Users,
      textColor: 'text-foreground',
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted/30',
      borderColor: 'border-border'
    },
    {
      label: 'Completed',
      value: '8',
      icon: CheckCircle,
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-900'
    },
    {
      label: 'In Progress',
      value: '4',
      icon: Clock,
      textColor: 'text-orange-700 dark:text-orange-500',
      iconColor: 'text-orange-600 dark:text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-900'
    },
    {
      label: 'Avg Completion',
      value: '67%',
      icon: Users,
      textColor: 'text-blue-700 dark:text-blue-500',
      iconColor: 'text-blue-600 dark:text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-900'
    }
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Client Onboarding Summary</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={metric.label} 
              className={`p-3 ${metric.bgColor} ${metric.borderColor} border-2 hover:shadow-md transition-shadow duration-300`}
            >
              <div className={`text-2xl font-bold ${metric.textColor} mb-1`}>{metric.value}</div>
              <div className={`text-xs font-medium ${metric.textColor}`}>{metric.label}</div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
