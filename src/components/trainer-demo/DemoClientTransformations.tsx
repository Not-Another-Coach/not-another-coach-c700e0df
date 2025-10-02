import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Quote } from 'lucide-react';

export function DemoClientTransformations() {
  const transformations = [
    {
      id: 1,
      clientName: "Sarah M.",
      duration: "12 weeks",
      achievement: "Lost 15kg & gained confidence",
      beforeStats: "Weight: 85kg | Body Fat: 32%",
      afterStats: "Weight: 70kg | Body Fat: 24%",
      quote: "The structured approach and constant support made all the difference. I finally found a sustainable way to reach my goals.",
      beforeColor: "from-gray-300 to-gray-400",
      afterColor: "from-success to-success/80"
    },
    {
      id: 2,
      clientName: "James T.",
      duration: "16 weeks",
      achievement: "Built muscle & strength",
      beforeStats: "Bench: 60kg | Squat: 80kg",
      afterStats: "Bench: 95kg | Squat: 140kg",
      quote: "The personalized programming and nutrition guidance helped me break through plateaus I'd been stuck at for years.",
      beforeColor: "from-gray-300 to-gray-400",
      afterColor: "from-primary to-primary/80"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl">Real Client Transformations</CardTitle>
          <p className="text-muted-foreground text-sm">
            Success stories from clients who committed to the journey
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transformations.map((transformation) => (
            <div 
              key={transformation.id}
              className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-background to-muted/20"
            >
              {/* Client Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{transformation.clientName}</h3>
                  <p className="text-sm text-muted-foreground">{transformation.duration} transformation</p>
                </div>
                <Badge variant="secondary" className="text-success border-success/20 bg-success/10">
                  {transformation.achievement}
                </Badge>
              </div>

              {/* Before & After Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Before
                  </div>
                  <div className={`aspect-[3/4] bg-gradient-to-br ${transformation.beforeColor} rounded-lg flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative text-white/80 text-sm font-medium px-4 py-2 bg-black/30 rounded">
                      Starting Point
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2 text-center">
                    {transformation.beforeStats}
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-primary" />
                </div>
                <div className="md:hidden flex items-center justify-center py-2">
                  <ArrowRight className="h-6 w-6 text-primary rotate-90" />
                </div>

                {/* After */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    After
                  </div>
                  <div className={`aspect-[3/4] bg-gradient-to-br ${transformation.afterColor} rounded-lg flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative text-white text-sm font-medium px-4 py-2 bg-black/30 rounded">
                      Goal Achieved
                    </div>
                  </div>
                  <div className="text-sm font-medium text-success bg-success/10 rounded p-2 text-center">
                    {transformation.afterStats}
                  </div>
                </div>
              </div>

              {/* Client Quote */}
              <div className="relative mt-6 pt-6 border-t">
                <Quote className="h-6 w-6 text-primary/20 absolute top-4 left-0" />
                <blockquote className="pl-8 italic text-muted-foreground">
                  "{transformation.quote}"
                </blockquote>
              </div>
            </div>
          ))}
        </div>

        {/* Results Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Results may vary. Individual results depend on commitment, consistency, and adherence to the program.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
