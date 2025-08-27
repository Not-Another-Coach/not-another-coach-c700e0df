import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Heart, Users, Calendar, Award } from 'lucide-react';
import { Trainer } from '@/components/TrainerCard';

interface StoryViewProps {
  trainer: Trainer;
}

// Helper function to get journey content from trainer data
const getJourneyContent = (trainer: any) => {
  return {
    howStarted: trainer.how_started || "My fitness journey began with a passion for helping others discover their potential.",
    philosophy: trainer.philosophy || "My coaching philosophy centers on sustainable, personalized approaches to fitness and wellness.",
    specialization: trainer.specialization_description || "I specialize in helping clients achieve their unique goals through evidence-based training methods."
  };
};

export const StoryView = ({ trainer }: StoryViewProps) => {
  const journeyContent = getJourneyContent(trainer as any);
  const milestones = (trainer as any).professional_milestones || [];
  const testimonials = (trainer as any).testimonials || [];

  return (
    <div className="space-y-6">
      {/* Personal Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            My Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-primary">How It All Started</h4>
            <p className="text-muted-foreground leading-relaxed">
              {journeyContent.howStarted}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-primary">My Philosophy</h4>
            <p className="text-muted-foreground leading-relaxed">
              {journeyContent.philosophy}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-primary">What I Specialize In</h4>
            <p className="text-muted-foreground leading-relaxed">
              {journeyContent.specialization}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Professional Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length > 0 ? (
            <div className="space-y-4">
              {milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="shrink-0">{milestone.year}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No professional milestones added yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Client Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Client Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testimonials.length > 0 ? (
            <div className="space-y-6">
              {testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="border rounded-lg p-6 bg-gradient-to-br from-muted/30 to-muted/10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{testimonial.clientName}</h4>
                        {testimonial.consentGiven && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      {testimonial.outcomeTag && (
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs">
                            {testimonial.outcomeTag}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <blockquote className="relative mb-4">
                    <Quote className="h-4 w-4 text-muted-foreground/50 absolute -top-1 -left-1" />
                    <p className="italic text-muted-foreground leading-relaxed pl-6">
                      "{testimonial.clientQuote}"
                    </p>
                  </blockquote>
                  
                  {testimonial.achievement && (
                    <p className="text-sm font-medium text-primary">
                      Achievement: {testimonial.achievement}
                    </p>
                  )}
                  
                  {(testimonial.beforeImage || testimonial.afterImage) && (
                    <div className="mt-4 flex gap-4">
                      {testimonial.beforeImage && (
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-2">Before</p>
                          <img 
                            src={testimonial.beforeImage} 
                            alt="Before transformation" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      {testimonial.afterImage && (
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-2">After</p>
                          <img 
                            src={testimonial.afterImage} 
                            alt="After transformation" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No client testimonials added yet.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
};