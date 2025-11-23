import { Card } from '@/components/ui/card';
import { Eye, Heart, Users, TrendingUp } from 'lucide-react';

export function DemoDashboardMetrics() {
  const metrics = [
    {
      label: 'Profile Views',
      value: '247',
      icon: Eye,
      color: 'text-white',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      label: 'Likes',
      value: '89',
      icon: Heart,
      color: 'text-white',
      bgGradient: 'bg-gradient-to-br from-red-500 to-pink-600'
    },
    {
      label: 'Shortlisted & Discovery',
      value: '34',
      icon: Users,
      color: 'text-white',
      bgGradient: 'bg-gradient-to-br from-yellow-500 to-orange-600'
    },
    {
      label: 'Conversion Rate',
      value: '36.0%',
      icon: TrendingUp,
      color: 'text-white',
      bgGradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={metric.label} 
            className={`p-6 ${metric.bgGradient} border-0 hover:shadow-xl hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className={`h-8 w-8 ${metric.color} opacity-90`} />
            </div>
            <div className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
            <div className={`text-sm ${metric.color} opacity-90`}>{metric.label}</div>
          </Card>
        );
      })}
    </div>
  );
}
