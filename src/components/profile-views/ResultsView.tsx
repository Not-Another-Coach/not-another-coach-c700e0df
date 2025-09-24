import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target, Users, Calendar, Zap } from 'lucide-react';
import { AnyTrainer } from '@/types/trainer';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { VisibilityAwareImage } from '@/components/ui/VisibilityAwareImage';
import { VisibilityAwareTestimonialSection } from '@/components/ui/VisibilityAwareTestimonialSection';
import { VisibilityAwareTestimonialContent } from '@/components/ui/VisibilityAwareTestimonialContent';
import { VisibilityAwareTestimonialStats } from '@/components/ui/VisibilityAwareTestimonialStats';

interface Testimonial {
  id: string;
  clientName: string;
  clientQuote: string;
  achievement: string;
  beforeImage?: string;
  afterImage?: string;
  outcomeTags?: string[];
  outcomeTag?: string; // Legacy support
  consentGiven: boolean;
  showImages: boolean;
}

interface ResultsViewProps {
  trainer: AnyTrainer;
}

// Helper function to process testimonials into results data
const processTestimonialsData = (testimonials: Testimonial[] = []) => {
  const transformationsWithImages = testimonials.filter(t => t.showImages && t.beforeImage && t.afterImage);
  const allTransformations = testimonials.filter(t => t.achievement);
  
  // Count outcome tags for specialized outcomes (support both old and new formats)
  const outcomeStats = testimonials.reduce((acc, testimonial) => {
    // Handle both new array format and old single tag format
    const tags = testimonial.outcomeTags || (testimonial.outcomeTag ? [testimonial.outcomeTag] : []);
    tags.forEach(tag => {
      if (tag && tag.trim()) {
        acc[tag] = (acc[tag] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Calculate basic stats - handle both old and new formats
  const totalClients = testimonials.length;
  const weightLossClients = testimonials.filter(t => {
    const tags = t.outcomeTags || (t.outcomeTag ? [t.outcomeTag] : []);
    return tags.some(tag => tag?.toLowerCase().includes('lost'));
  }).length;
  const strengthClients = testimonials.filter(t => {
    const tags = t.outcomeTags || (t.outcomeTag ? [t.outcomeTag] : []);
    return tags.some(tag => tag?.toLowerCase().includes('strength') || tag?.toLowerCase().includes('muscle'));
  }).length;

  return {
    beforeAfterImages: transformationsWithImages.map(t => ({
      id: t.id,
      clientName: t.clientName,
      before: t.beforeImage!,
      after: t.afterImage!,
      achievement: t.achievement,
      outcomeTags: t.outcomeTags || (t.outcomeTag ? [t.outcomeTag] : [])
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
  
  // Get visibility state for testimonial images/content
  const { stage: engagementStage, isGuest } = useEngagementStage((trainer as any).id || '');
  const { getVisibility } = useContentVisibility({
    engagementStage,
    isGuest
  });
  
  const testimonialVisibility = getVisibility('testimonial_images');

  if (testimonials.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
            <p className="text-muted-foreground">
              Add testimonials and transformations in the Profile Management section to showcase your achievements.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <VisibilityAwareTestimonialSection
              visibilityState={testimonialVisibility}
              title="Client Transformations"
              itemCount={resultsData.beforeAfterImages.length}
              lockMessage="Connect with trainer to see transformation photos"
            >
              <div className="grid gap-6">
                {resultsData.beforeAfterImages.map((transformation) => (
                  <div key={transformation.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Before</h4>
                        <div className="relative">
                          <VisibilityAwareImage
                            src={transformation.before}
                            alt="Before transformation"
                            visibilityState={testimonialVisibility}
                            className="w-full h-48 object-cover rounded-lg"
                            lockMessage="Engage to see before photo"
                          />
                          {testimonialVisibility === 'visible' && (
                            <Badge className="absolute top-2 left-2 bg-red-500">Before</Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">After</h4>
                        <div className="relative">
                          <VisibilityAwareImage
                            src={transformation.after}
                            alt="After transformation"
                            visibilityState={testimonialVisibility}
                            className="w-full h-48 object-cover rounded-lg"
                            lockMessage="Engage to see after photo"
                          />
                          {testimonialVisibility === 'visible' && (
                            <Badge className="absolute top-2 left-2 bg-success">After</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {testimonialVisibility === 'visible' && (
                      <>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{transformation.clientName}</span>
                          </div>
                          {transformation.outcomeTags && transformation.outcomeTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {transformation.outcomeTags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <strong>Achievement:</strong> {transformation.achievement}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </VisibilityAwareTestimonialSection>
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
            <VisibilityAwareTestimonialStats
              stats={resultsData.specializedOutcomes}
              visibilityState={testimonialVisibility}
              title="Specialized Outcomes"
              lockMessage="Connect with trainer to see detailed outcome statistics"
            />
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
          <VisibilityAwareTestimonialSection
            visibilityState={testimonialVisibility}
            title="Client Achievements"
            itemCount={testimonials.length}
            lockMessage="Connect with trainer to see detailed client testimonials"
          >
            <div className="space-y-4">
              {testimonials.map((testimonial: Testimonial, index: number) => {
                // For anonymous users: show 1 visible testimonial when set to visible, blur the rest
                let itemVisibility = testimonialVisibility;
                if (isGuest && testimonialVisibility === 'visible' && index > 0) {
                  itemVisibility = 'blurred';
                }
                
                return (
                  <VisibilityAwareTestimonialContent
                    key={testimonial.id}
                    testimonial={testimonial}
                    visibilityState={itemVisibility}
                    className="border-l-4 border-primary"
                    lockMessage="Engage with trainer to see testimonial details"
                  />
                );
              })}
            </div>
          </VisibilityAwareTestimonialSection>
        </CardContent>
      </Card>
    </div>
  );
};