import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Quote } from "lucide-react";
import { AnyTrainer } from "@/types/trainer";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { VisibilityAwareImage } from '@/components/ui/VisibilityAwareImage';
import { VisibilityAwareName } from '@/components/ui/VisibilityAwareName';

interface ClientTransformationViewProps {
  trainer: AnyTrainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
  testimonialIndex?: number; // Which specific testimonial to display (0-based index)
}

// Real transformation data from trainer's testimonials
const getTransformationData = (trainer: AnyTrainer) => {
  // Get testimonials from trainer data
  const testimonials = (trainer as any).testimonials || [];
  
  // Debug logging for Lou specifically
  if (trainer.name && trainer.name.toLowerCase().includes('lou')) {
    console.log(`🐛 DEBUG Lou Testimonials in ClientTransformationView:`, {
      trainerId: trainer.id,
      trainerName: trainer.name,
      testimonials: testimonials,
      testimonialsLength: testimonials.length,
      fullTrainerObject: trainer
    });
  }
  
  // Filter for testimonials with before/after images and consent
  const transformationsWithImages = testimonials.filter((t: any) => 
    t.showImages && t.beforeImage && t.afterImage && t.consentGiven
  );
  
  // Debug filtered results
  if (trainer.name && trainer.name.toLowerCase().includes('lou')) {
    console.log(`🐛 DEBUG Lou Filtered Transformations:`, {
      transformationsWithImages,
      filteredLength: transformationsWithImages.length
    });
  }
  
  // Limit to 5 transformations maximum
  const limitedTransformations = transformationsWithImages.slice(0, 5);
  
  return {
    transformations: limitedTransformations.map((t: any, index: number) => ({
      id: t.id || `transformation-${index}`,
      before: t.beforeImage,
      after: t.afterImage,
      clientName: t.clientName || 'Client',
      testimonial: t.clientQuote || 'Amazing results achieved!',
      achievement: t.achievement || 'Transformation',
      outcomeTag: t.outcomeTag || 'Success'
    }))
  };
};

export const ClientTransformationView = ({ trainer, children, testimonialIndex = 0 }: ClientTransformationViewProps) => {
  const transformationData = getTransformationData(trainer);
  
  // Add visibility logic
  const { stage, isGuest } = useEngagementStage(trainer.id);
  const { getVisibility, loading: visibilityLoading } = useContentVisibility({
    engagementStage: stage || 'browsing',
    isGuest
  });

  const testimonialVisibility = getVisibility('testimonial_images');

  // If no transformations available, show placeholder
  if (transformationData.transformations.length === 0) {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
        <CardContent className="p-0">
          {/* Interactive elements overlay */}
          {children}
          
          {/* Placeholder when no testimonials */}
          <div className="relative aspect-square">
            <div className="flex items-center justify-center h-full bg-muted/50">
              <div className="text-center p-6">
                <Quote className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No client transformations available yet</p>
              </div>
            </div>
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Trainer Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <VisibilityAwareName
                    trainer={{
                      id: trainer.id,
                      first_name: (trainer as any).firstName || (trainer as any).first_name,
                      last_name: (trainer as any).lastName || (trainer as any).last_name,
                      name: trainer.name
                    }}
                    visibilityState="visible"  // Will be controlled by parent visibility logic
                    variant="overlay"
                    className="font-bold text-lg mb-1 text-white drop-shadow-sm"
                  />
                  
                  <div className="flex items-center gap-3 text-white/90 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="font-medium">{trainer.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{trainer.location}</span>
                    </div>
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <div className="text-xl font-bold text-white drop-shadow-sm">
                    {getTrainerDisplayPrice(trainer)}
                  </div>
                  <div className="text-xs text-white/80">packages</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the specific testimonial to display based on the index
  const currentTransformation = transformationData.transformations[testimonialIndex] || transformationData.transformations[0];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Current testimonial - Before/After Split with Visibility */}
        <div className="aspect-square relative">
          <div className="grid grid-cols-2 gap-1 h-full">
            {/* Before Image */}
            <div className="relative overflow-hidden">
              <VisibilityAwareImage
                src={currentTransformation.before}
                alt="Before transformation"
                className="w-full h-full object-cover"
                visibilityState={testimonialVisibility}
                lockMessage="Before photos unlock with engagement"
              >
                {testimonialVisibility === 'visible' && (
                  <div className="absolute top-3 left-3">
                    <Badge className="text-sm bg-black/70 text-white border-0 px-3 py-1">
                      Before
                    </Badge>
                  </div>
                )}
              </VisibilityAwareImage>
            </div>
            
            {/* After Image - Blurred for guests even when testimonials are "visible" to encourage signup */}
            <div className="relative overflow-hidden">
              <VisibilityAwareImage
                src={currentTransformation.after}
                alt="After transformation"
                className="w-full h-full object-cover"
                visibilityState={testimonialVisibility === 'visible' && isGuest ? 'blurred' : testimonialVisibility}
                lockMessage="Sign up to see full transformations"
              >
                {(testimonialVisibility === 'visible' || (testimonialVisibility === 'blurred' && !isGuest)) && (
                  <div className="absolute top-3 right-3">
                    <Badge className="text-sm bg-success text-white border-0 px-3 py-1">
                      After
                    </Badge>
                  </div>
                )}
              </VisibilityAwareImage>
            </div>
          </div>
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Testimonial indicator - show which testimonial this is */}
        {transformationData.transformations.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs text-white">
              {testimonialIndex + 1}/{transformationData.transformations.length}
            </span>
          </div>
        )}

        {/* Trainer Info & Current Testimonial Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <VisibilityAwareName
                trainer={{
                  id: trainer.id,
                  first_name: (trainer as any).firstName || (trainer as any).first_name,
                  last_name: (trainer as any).lastName || (trainer as any).last_name,
                  name: trainer.name
                }}
                visibilityState="visible"  // Will be controlled by parent visibility logic
                variant="overlay"
                className="font-bold text-lg mb-1 text-white drop-shadow-sm"
              />
              
              <div className="flex items-center gap-3 text-white/90 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-medium">{trainer.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{trainer.location}</span>
                </div>
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-xl font-bold text-white drop-shadow-sm">
                {getTrainerDisplayPrice(trainer)}
              </div>
              <div className="text-xs text-white/80">packages</div>
            </div>
          </div>

          {/* Current Testimonial with Visibility */}
          {testimonialVisibility === 'visible' ? (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-start gap-2">
                <Quote className="h-3 w-3 text-white/70 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white/90 italic mb-1 leading-relaxed">
                    "{currentTransformation.testimonial}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">
                      - {currentTransformation.clientName}
                    </span>
                    <Badge className="text-xs bg-success/20 text-success-foreground border-success/30">
                      {currentTransformation.achievement}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : testimonialVisibility === 'blurred' ? (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-start gap-2">
                <Quote className="h-3 w-3 text-white/70 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                   <p className="text-sm text-white/70 italic mb-1 leading-relaxed">
                     "{currentTransformation.testimonial}"
                   </p>
                   <div className="flex items-center justify-between">
                     <span className="text-xs text-white/60">
                       - {currentTransformation.clientName}
                     </span>
                     <Badge className="text-xs bg-success/20 text-success-foreground border-success/30 opacity-70">
                       {currentTransformation.achievement}
                     </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center justify-center">
                <span className="text-xs text-white/70">
                  Client testimonials unlock as you engage
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};