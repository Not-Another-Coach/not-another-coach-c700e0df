import { Card } from '@/components/ui/card';
import { Eye, Heart, Users, TrendingUp } from 'lucide-react';

export function DemoDashboardMetrics() {
  const metrics = [
    {
      label: 'Profile Views',
      value: '247',
      icon: Eye,
      textColor: 'text-blue-700 dark:text-blue-500',
      iconColor: 'text-blue-600 dark:text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-900',
      dashColor: 'bg-blue-600 dark:bg-blue-500'
    },
    {
      label: 'Likes',
      value: '89',
      icon: Heart,
      textColor: 'text-red-700 dark:text-red-500',
      iconColor: 'text-red-600 dark:text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-900',
      dashColor: 'bg-red-600 dark:bg-red-500'
    },
    {
      label: 'Shortlisted & Discovery',
      value: '34',
      icon: Users,
      textColor: 'text-yellow-700 dark:text-yellow-500',
      iconColor: 'text-yellow-600 dark:text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200 dark:border-yellow-900',
      dashColor: 'bg-yellow-600 dark:bg-yellow-500'
    },
    {
      label: 'Conversion Rate',
      value: '36.0%',
      icon: TrendingUp,
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-900',
      dashColor: 'bg-green-600 dark:bg-green-500'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-foreground mb-6">Performance Metrics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={metric.label} 
              className={`p-6 ${metric.bgColor} ${metric.borderColor} border-2 hover:shadow-md transition-shadow duration-300`}
            >
              <div className="flex justify-center mb-4">
                <div className="flex gap-1">
                  <div className={`w-3 h-1 ${metric.dashColor}`}></div>
                  <div className={`w-3 h-1 ${metric.dashColor}`}></div>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className={`text-3xl font-bold ${metric.textColor}`}>{metric.value}</div>
                <div className={`text-base font-medium ${metric.textColor}`}>{metric.label}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
