import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Upload, FileText, Smartphone, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GettingStartedStatsProps {
  sessionsBooked: number;
  photosUploaded: number;
  formsCompleted: number;
  totalForms: number;
  syncsConnected: number;
  completedSteps: number;
  totalSteps: number;
  onStatClick?: (statType: string) => void;
}

export const GettingStartedStats = ({
  sessionsBooked,
  photosUploaded,
  formsCompleted,
  totalForms,
  syncsConnected,
  completedSteps,
  totalSteps,
  onStatClick
}: GettingStartedStatsProps) => {
  const stats = [
    {
      id: 'sessions',
      label: 'Sessions',
      sublabel: 'booked',
      value: sessionsBooked,
      icon: Calendar,
      color: 'bg-primary-50 text-primary-600 border-primary-200',
      iconColor: 'text-primary-600'
    },
    {
      id: 'photos',
      label: 'Photos',
      sublabel: 'uploaded',
      value: photosUploaded,
      icon: Upload,
      color: 'bg-secondary-50 text-secondary-600 border-secondary-200',
      iconColor: 'text-secondary-600'
    },
    {
      id: 'forms',
      label: 'Forms',
      sublabel: `${formsCompleted}/${totalForms}`,
      value: formsCompleted,
      icon: FileText,
      color: 'bg-accent-50 text-accent-600 border-accent-200',
      iconColor: 'text-accent-600',
      showFraction: true,
      total: totalForms
    },
    {
      id: 'progress',
      label: 'Progress',
      sublabel: `${completedSteps}/${totalSteps}`,
      value: Math.round((completedSteps / totalSteps) * 100),
      icon: CheckCircle,
      color: 'bg-success-50 text-success-600 border-success-200',
      iconColor: 'text-success-600',
      isPercentage: true
    }
  ];

  // Only show syncs if there are any
  if (syncsConnected > 0) {
    stats.splice(3, 0, {
      id: 'syncs',
      label: 'Apps',
      sublabel: 'connected',
      value: syncsConnected,
      icon: Smartphone,
      color: 'bg-muted text-muted-foreground border-muted',
      iconColor: 'text-muted-foreground'
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Getting Started</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isComplete = stat.showFraction 
            ? stat.value === stat.total 
            : stat.isPercentage 
              ? stat.value === 100 
              : stat.value > 0;

          return (
            <Card
              key={stat.id}
              className={`cursor-pointer hover:shadow-md transition-all ${stat.color} ${
                isComplete ? 'ring-2 ring-success-200' : ''
              }`}
              onClick={() => onStatClick?.(stat.id)}
            >
              <CardContent className="p-2 flex flex-col items-center text-center">
                <div className="p-1 rounded-full bg-background/60 mb-1 relative">
                  <Icon className={`h-3 w-3 ${stat.iconColor}`} />
                  {isComplete && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="h-3 w-3 text-success-600 bg-background rounded-full" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold">
                    {stat.showFraction 
                      ? `${stat.value}/${stat.total}`
                      : stat.isPercentage 
                        ? `${stat.value}%`
                        : stat.value
                    }
                  </p>
                  <p className="text-xs opacity-75">{stat.sublabel}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};