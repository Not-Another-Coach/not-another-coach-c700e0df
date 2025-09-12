import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

interface EarningsCalculatorProps {
  initialRate?: number;
  onRateChange?: (rate: number) => void;
  onInteraction?: () => void;
}

export function EarningsCalculator({ initialRate = 50, onRateChange, onInteraction }: EarningsCalculatorProps) {
  const [hourlyRate, setHourlyRate] = useState(initialRate);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleRateChange = (value: number[]) => {
    setHourlyRate(value[0]);
    onRateChange?.(value[0]);
    
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteraction?.();
    }
  };

  const handleSessionsChange = (value: number[]) => {
    setSessionsPerWeek(value[0]);
    
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteraction?.();
    }
  };

  // Calculate potential earnings
  const weeklyEarnings = hourlyRate * sessionsPerWeek;
  const monthlyEarnings = weeklyEarnings * 4.33; // Average weeks per month
  const yearlyEarnings = monthlyEarnings * 12;

  // Commission calculation (assuming 10% platform fee)
  const platformFee = monthlyEarnings * 0.1;
  const netMonthlyEarnings = monthlyEarnings - platformFee;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Earnings Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See your potential income as a coach on our platform
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hourly Rate Slider */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Hourly Rate</Label>
          <div className="space-y-3">
            <Slider
              value={[hourlyRate]}
              onValueChange={handleRateChange}
              max={200}
              min={25}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>£25</span>
              <Badge variant="secondary" className="text-lg font-semibold">
                £{hourlyRate}/hour
              </Badge>
              <span>£200</span>
            </div>
          </div>
        </div>

        {/* Sessions Per Week */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sessions Per Week</Label>
          <div className="space-y-3">
            <Slider
              value={[sessionsPerWeek]}
              onValueChange={handleSessionsChange}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 session</span>
              <Badge variant="outline">
                {sessionsPerWeek} sessions/week
              </Badge>
              <span>20 sessions</span>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">£{weeklyEarnings.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">Weekly</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">£{Math.round(netMonthlyEarnings)}</div>
            <div className="text-sm text-muted-foreground">Monthly (after fees)</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">£{Math.round(yearlyEarnings)}</div>
            <div className="text-sm text-muted-foreground">Yearly (gross)</div>
          </div>
        </div>

        {/* Platform Fee Info */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Platform Fee Breakdown</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Gross Monthly: £{monthlyEarnings.toFixed(0)}</div>
            <div>Platform Fee (10%): £{platformFee.toFixed(0)}</div>
            <div className="font-medium">Net Monthly: £{netMonthlyEarnings.toFixed(0)}</div>
            <div></div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">
            Coaches with similar rates typically earn £{Math.round(netMonthlyEarnings * 0.8)}-£{Math.round(netMonthlyEarnings * 1.2)}/month
          </span>
        </div>
      </CardContent>
    </Card>
  );
}