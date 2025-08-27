import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target, Users, Calendar, Zap } from 'lucide-react';
import { Trainer } from '@/components/TrainerCard';

interface Testimonial {
  id: string;
  clientName: string;
  clientQuote: string;
  achievement: string;
  beforeImage?: string;
  afterImage?: string;
  outcomeTag: string;
  consentGiven: boolean;
  showImages: boolean;
}

interface ResultsViewProps {
  trainer: Trainer;
}

// Helper function to process testimonials into results data
const processTestimonialsData = (testimonials: Testimonial[] = []) => {
  const transformationsWithImages = testimonials.filter(t => t.showImages && t.beforeImage && t.afterImage);
  const allTransformations = testimonials.filter(t => t.achievement);
  
  // Count outcome tags for specialized outcomes
  const outcomeStats = testimonials.reduce((acc, testimonial) => {
    if (testimonial.outcomeTag) {
      acc[testimonial.outcomeTag] = (acc[testimonial.outcomeTag] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate basic stats
  const totalClients = testimonials.length;
  const weightLossClients = testimonials.filter(t => t.outcomeTag.toLowerCase().includes('lost')).length;
  const strengthClients = testimonials.filter(t => t.outcomeTag.toLowerCase().includes('strength') || t.outcomeTag.toLowerCase().includes('muscle')).length;

  return {
    beforeAfterImages: transformationsWithImages.map(t => ({
      id: t.id,
      clientName: t.clientName,
      before: t.beforeImage!,
      after: t.afterImage!,
      achievement: t.achievement,
      outcomeTag: t.outcomeTag
    })),
    stats: {
      clientsTransformed: totalClients,
      totalTestimonials: testimonials.length,
      imagesShared: transformationsWithImages.length,
      outcomeVariety: Object.keys(outcomeStats).length
    },
    achievements: [
      { label: "Total Testimonials", value: Math.min(testimonials.length, 100), unit: "" },
      { label: "Visual Transformations", value: Math.min(transformationsWithImages.length, 50), unit: "" },
      { label: "Weight Loss Success", value: Math.min(weightLossClients * 10, 100), unit: "%" },
      { label: "Strength Outcomes", value: Math.min(strengthClients * 15, 100), unit: "%" }
    ],
    specializedOutcomes: outcomeStats
  };
};

export const ResultsView = ({ trainer }: ResultsViewProps) => {
  const testimonials = (trainer as any).testimonials || [];
  const resultsData = processTestimonialsData(testimonials);

  if (testimonials.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
            <p className="text-muted-foreground">
              Add testimonials and case studies in the Profile Management section to showcase your client transformations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Success Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{resultsData.stats.clientsTransformed}</div>
              <div className="text-sm text-muted-foreground">Client Testimonials</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">{resultsData.stats.imagesShared}</div>
              <div className="text-sm text-muted-foreground">Visual Transformations</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">{resultsData.stats.outcomeVariety}</div>
              <div className="text-sm text-muted-foreground">Different Outcomes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-energy/10 to-energy/5 rounded-lg">
              <div className="text-2xl font-bold text-energy">{trainer.rating}</div>
              <div className="text-sm text-muted-foreground">Star Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resultsData.achievements.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{achievement.label}</span>
                  <span className="text-sm font-bold">{achievement.value}{achievement.unit}</span>
                </div>
                <Progress value={Math.min(achievement.value, 100)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Before & After Gallery */}
      {resultsData.beforeAfterImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Client Transformations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {resultsData.beforeAfterImages.map((transformation) => (
                <div key={transformation.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Before</h4>
                      <div className="relative">
                        <img
                          src={transformation.before}
                          alt="Before transformation"
                          className="w-full h-48 object-cover rounded-lg bg-muted"
                        />
                        <Badge className="absolute top-2 left-2 bg-red-500">Before</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">After</h4>
                      <div className="relative">
                        <img
                          src={transformation.after}
                          alt="After transformation"
                          className="w-full h-48 object-cover rounded-lg bg-muted"
                        />
                        <Badge className="absolute top-2 left-2 bg-success">After</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{transformation.clientName}</span>
                    </div>
                    {transformation.outcomeTag && (
                      <Badge variant="secondary" className="text-xs">
                        {transformation.outcomeTag}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <strong>Achievement:</strong> {transformation.achievement}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specialized Results */}
      {Object.keys(resultsData.specializedOutcomes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Specialized Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(resultsData.specializedOutcomes).map(([outcome, count]) => (
                <div key={outcome} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{outcome}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Clients achieved:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success rate:</span>
                      <span className="font-medium">100%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Client Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Client Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials.map((testimonial: Testimonial) => (
              <div key={testimonial.id} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{testimonial.clientName}</span>
                  {testimonial.outcomeTag && (
                    <Badge variant="outline" className="text-xs">
                      {testimonial.outcomeTag}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Achievement:</strong> {testimonial.achievement}
                </p>
                <blockquote className="text-sm italic text-muted-foreground mt-1">
                  "{testimonial.clientQuote}"
                </blockquote>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};