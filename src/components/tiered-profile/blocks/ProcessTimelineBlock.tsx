import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, ClipboardList, TrendingUp, Users } from 'lucide-react';

interface ProcessTimelineBlockProps {
  trainer: any;
}

export const ProcessTimelineBlock = ({ trainer }: ProcessTimelineBlockProps) => {
  const steps = [
    {
      icon: Calendar,
      title: 'Discovery Call',
      description: 'Free 15-minute consultation to discuss your goals',
      status: 'active'
    },
    {
      icon: MessageSquare,
      title: 'App Login',
      description: 'Access your personalized training app',
      status: 'pending'
    },
    {
      icon: ClipboardList,
      title: 'Onboarding Survey',
      description: 'Complete detailed fitness and lifestyle assessment',
      status: 'pending'
    },
    {
      icon: TrendingUp,
      title: 'Plan Drop',
      description: 'Receive your custom training and nutrition plan',
      status: 'pending'
    },
    {
      icon: Users,
      title: 'Weekly Check-In',
      description: 'Regular progress reviews and plan adjustments',
      status: 'pending'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Process</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'active' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{step.title}</h4>
                    {step.status === 'active' && (
                      <Badge variant="secondary" className="text-xs">Next</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};