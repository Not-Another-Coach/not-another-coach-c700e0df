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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground">Client Onboarding Summary</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={metric.label} 
              className={`p-6 ${metric.bgColor} ${metric.borderColor} border-2 hover:shadow-md transition-shadow duration-300`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-8 w-8 ${metric.iconColor}`} />
                <div className="flex gap-1">
                  <div className={`w-3 h-1 ${metric.iconColor} opacity-60`}></div>
                  <div className={`w-3 h-1 ${metric.iconColor} opacity-60`}></div>
                </div>
              </div>
              <div className={`text-4xl font-bold ${metric.textColor} mb-2`}>{metric.value}</div>
              <div className={`text-base font-medium ${metric.textColor}`}>{metric.label}</div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
