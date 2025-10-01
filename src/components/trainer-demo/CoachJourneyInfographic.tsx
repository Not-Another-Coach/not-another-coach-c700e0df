import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Users, CreditCard, TrendingUp, ArrowRight } from 'lucide-react';

export function CoachJourneyInfographic() {
  const steps = [
    {
      number: 1,
      title: 'Create Your Profile',
      description: 'Upload your photo, bio & expertise',
      icon: User,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      number: 2,
      title: 'Set Availability',
      description: 'Sync calendar & manage sessions',
      icon: Calendar,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      number: 3,
      title: 'Get Matched',
      description: 'Connect with motivated clients',
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      number: 4,
      title: 'Manage Bookings',
      description: 'Handle payments & scheduling',
      icon: CreditCard,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      number: 5,
      title: 'Grow Your Business',
      description: 'Track progress & scale income',
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Your Coach Journey</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          5 simple steps to building a thriving coaching business
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.number} className="relative">
                <div className="flex items-start gap-4">
                  {/* Step number & icon */}
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${step.bgColor} ${step.color} font-bold text-lg border-2 border-card shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-12 bg-border mt-2" />
                    )}
                  </div>
                  
                  {/* Step content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${step.color} bg-card px-2 py-0.5 rounded-full border`}>
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {/* Arrow for visual flow */}
                  {!isLast && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 mt-3" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="font-semibold text-sm mb-1">Average Time to First Client</div>
            <div className="text-2xl font-bold text-primary">7 days</div>
            <div className="text-xs text-muted-foreground mt-1">Join 500+ successful coaches</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
