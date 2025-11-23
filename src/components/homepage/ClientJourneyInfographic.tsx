import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Search, MessageSquare, CheckCircle, Shield, ArrowRight } from 'lucide-react';

export function ClientJourneyInfographic() {
  const steps = [
    {
      number: 1,
      title: 'Create Your Profile',
      description: 'Share your goals, preferences & availability so we can match you with the right coaches',
      icon: User,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      number: 2,
      title: 'Browse Trainer Profiles',
      description: 'Search and filter verified trainers by style, experience, reviews & price',
      icon: Search,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      number: 3,
      title: 'Vet Your Coach',
      description: 'Book a free discovery call or send messages to ask questions and check the vibe',
      icon: MessageSquare,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      number: 4,
      title: 'Choose Your Coach & Package',
      description: 'Pick the trainer and package that fits your goals, schedule & budget',
      icon: CheckCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      number: 5,
      title: 'Train With Protected Payments',
      description: 'Start your program. Payment is held securely and your trainer is only paid once you\'re happy with what\'s been delivered',
      icon: Shield,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Your Coaching Journey</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          5 simple steps to finding your perfect coach
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 overflow-x-auto pb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.number} className="flex items-center gap-4">
                {/* Step card */}
                <div className="flex flex-col items-center min-w-[140px]">
                  <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${step.bgColor} ${step.color} font-bold text-lg border-2 border-card shadow-md mb-3`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  
                  <div className="text-center">
                    <span className={`text-xs font-semibold ${step.color} bg-card px-2 py-0.5 rounded-full border mb-2 inline-block`}>
                      Step {step.number}
                    </span>
                    <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                
                {/* Arrow between steps */}
                {!isLast && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
