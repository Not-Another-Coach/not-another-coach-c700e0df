import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Calendar, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface WaysOfWorkingBlockProps {
  trainer: any;
}

export const WaysOfWorkingBlock = ({ trainer }: WaysOfWorkingBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const waysOfWorking = [
    { icon: Smartphone, label: 'App-Based', description: 'Custom training app with progress tracking' },
    { icon: Calendar, label: 'Weekly Check-Ins', description: 'Regular progress reviews and plan adjustments' },
    { icon: Brain, label: 'Mindset Support', description: 'Mental coaching alongside physical training' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ways I Work</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {waysOfWorking.map(({ icon: Icon, label, description }) => (
            <div key={label} className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium">{label}</h4>
              {isExpanded && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Learn More
            </>
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h4 className="font-medium mb-2">Communication Style</h4>
              <p className="text-sm text-muted-foreground">
                {trainer.communication_style || 'Supportive and encouraging with clear guidance'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Training Approach</h4>
              <p className="text-sm text-muted-foreground">
                {trainer.training_vibe || 'Balanced approach combining technique, motivation, and progression'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};