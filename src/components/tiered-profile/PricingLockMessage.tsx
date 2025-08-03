import { Card, CardContent } from '@/components/ui/card';
import { Lock, Calendar } from 'lucide-react';

interface PricingLockMessageProps {
  trainer: any;
}

export const PricingLockMessage = ({ trainer }: PricingLockMessageProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-primary">Pricing Shared After Discovery Call</h3>
          <p className="text-sm text-muted-foreground">
            I share pricing once we've had a discovery call to ensure the right fit and discuss your specific needs.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Calendar className="w-4 h-4" />
          <span>Free 15-minute consultation</span>
        </div>
      </CardContent>
    </Card>
  );
};