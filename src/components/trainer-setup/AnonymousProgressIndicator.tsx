import { useAnonymousTrainerSession } from '@/hooks/useAnonymousTrainerSession';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';

export function AnonymousProgressIndicator() {
  const { progressTracking, getProgressPercentage } = useAnonymousTrainerSession();
  
  if (!progressTracking) return null;
  
  const progress = getProgressPercentage();
  
  const steps = [
    { 
      key: 'basicInfoComplete', 
      label: 'Basic Information', 
      complete: progressTracking.basicInfoComplete 
    },
    { 
      key: 'specializationsComplete', 
      label: 'Specializations', 
      complete: progressTracking.specializationsComplete 
    },
    { 
      key: 'ratesComplete', 
      label: 'Rates & Pricing', 
      complete: progressTracking.ratesComplete 
    },
    { 
      key: 'previewGenerated', 
      label: 'Profile Preview', 
      complete: progressTracking.previewGenerated 
    },
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Profile Setup Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          {steps.map((step) => (
            <div 
              key={step.key} 
              className="flex items-center gap-2 text-sm"
            >
              {step.complete ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={step.complete ? 'text-foreground' : 'text-muted-foreground'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        
        {progress === 100 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-success font-medium">
              ✓ Ready to publish! Create your account to go live.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
