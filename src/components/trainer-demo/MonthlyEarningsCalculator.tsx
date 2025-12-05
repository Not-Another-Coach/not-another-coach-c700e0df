import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MonthlyEarningsCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(500);
  const navigate = useNavigate();

  // Calculations
  const starterCommission = monthlyRevenue * 0.10;
  const builderCost = 50;
  const savings = starterCommission - builderCost;
  const breakEvenPoint = 500; // £50 / 0.10 = £500

  const handleRevenueChange = (value: number[]) => {
    setMonthlyRevenue(value[0]);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="h-6 w-6 text-primary" />
              Earnings Calculator
            </CardTitle>
            <p className="text-muted-foreground">
              See how much you could save by upgrading to Builder
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Slider Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  What's your monthly package revenue?
                </label>
                <Badge variant="secondary" className="text-lg font-semibold">
                  £{monthlyRevenue}
                </Badge>
              </div>
              
              <Slider
                value={[monthlyRevenue]}
                onValueChange={handleRevenueChange}
                max={5000}
                min={0}
                step={50}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>£0</span>
                <span>£5,000</span>
              </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              {/* Starter Plan */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Starter Plan</span>
                  <Badge variant="outline">£9.99/mo</Badge>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    £{starterCommission.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Commission (10%)
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">You keep: </span>
                  <span className="text-primary">£{(monthlyRevenue - starterCommission).toFixed(2)}</span>
                </div>
              </div>

              {/* Builder Plan */}
              <div className="space-y-3 p-4 rounded-lg border bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Builder Plan</span>
                  <Badge className="bg-primary text-primary-foreground">£50/mo</Badge>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    £0.00
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Commission (0%)
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">You keep: </span>
                  <span className="text-primary">£{(monthlyRevenue - builderCost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            <div className={`p-6 rounded-lg ${savings > 0 ? 'bg-primary/10' : 'bg-muted/50'}`}>
              {savings > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Builder saves you money!</span>
                  </div>
                  <p className="text-sm">
                    At <span className="font-semibold">£{monthlyRevenue}</span> monthly revenue:
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      • On Starter you'd pay <span className="font-semibold">£{starterCommission.toFixed(2)}</span> in commission
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Builder (£50) would net you <span className="font-semibold text-primary">+£{savings.toFixed(2)}/month</span>
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => navigate('/auth/signup/trainer')}
                  >
                    Start Building Your Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-semibold">Starter is perfect for you right now</p>
                  <p className="text-sm text-muted-foreground">
                    Builder makes sense when you earn <span className="font-semibold">£{breakEvenPoint}+/month</span>. 
                    Start with Starter and upgrade when you're ready!
                  </p>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/auth/signup/trainer')}
                  >
                    Start with Starter Plan
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
