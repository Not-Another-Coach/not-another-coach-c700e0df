import { Card } from '@/components/ui/card';
import { Eye, Heart, Users, TrendingUp } from 'lucide-react';

export function DemoDashboardMetrics() {
  const metrics = [
    {
      label: 'Profile Views',
      value: '247',
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Likes',
      value: '89',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      label: 'Shortlisted & Discovery',
      value: '34',
      icon: Users,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Conversion Rate',
      value: '36.0%',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="p-4 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
            <div className="text-sm text-muted-foreground">{metric.label}</div>
          </Card>
        );
      })}
    </div>
  );
}
