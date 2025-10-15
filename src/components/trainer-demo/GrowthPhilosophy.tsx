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

              {/* Progression Bar */}
              <div className="pt-8 pb-4">
                <div className="relative max-w-2xl mx-auto">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-muted via-primary/30 to-primary transform -translate-y-1/2" />
                  
                  {/* Milestones */}
                  <div className="relative flex justify-between items-center">
                    {/* Starter */}
                    <div className="flex flex-col items-center gap-3 bg-background px-4">
                      <div className="w-12 h-12 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                        <span className="text-lg font-bold">1</span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Starter</div>
                        <div className="text-sm text-primary">Keep 90%</div>
                      </div>
                    </div>

                    {/* Builder */}
                    <div className="flex flex-col items-center gap-3 bg-background px-4">
                      <div className="w-12 h-12 rounded-full bg-primary border-4 border-background flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">2</span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Builder</div>
                        <div className="text-sm text-primary">Keep 100%</div>
                      </div>
                    </div>

                    {/* Future */}
                    <div className="flex flex-col items-center gap-3 bg-background px-4 opacity-50">
                      <div className="w-12 h-12 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                        <span className="text-lg font-bold">3</span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Elite</div>
                        <div className="text-sm text-muted-foreground">Coming soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
