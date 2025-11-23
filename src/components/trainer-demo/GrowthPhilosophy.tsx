import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function GrowthPhilosophy() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold">
                We grow when you do
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No feature gates. No hidden fees. Just fair pricing that rewards your success.
                Start affordable, scale profitably.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
