import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trainer } from "@/components/TrainerCard";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";
import { useState, useEffect } from "react";

interface ClientTransformationViewProps {
  trainer: Trainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
}

// Real transformation data from trainer's testimonials
const getTransformationData = (trainer: Trainer) => {
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

export const ClientTransformationView = ({ trainer, children }: ClientTransformationViewProps) => {
  const transformationData = getTransformationData(trainer);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Reset to first testimonial when trainer changes or transformations change
  useEffect(() => {
    setCurrentIndex(0);
  }, [trainer.id, transformationData.transformations.length]);
  
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
                  <h3 className="font-bold text-lg mb-1 text-white drop-shadow-sm">
                    {trainer.name}
                  </h3>
                  
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

  const currentTransformation = transformationData.transformations[currentIndex];
  const hasMultiple = transformationData.transformations.length > 1;

  // Navigation functions
  const goToPrevious = () => {
    console.log('🔄 Testimonial Navigation - Previous clicked', {
      currentIndex,
      totalTestimonials: transformationData.transformations.length,
      willGoTo: currentIndex > 0 ? currentIndex - 1 : transformationData.transformations.length - 1
    });
    
    setCurrentIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : transformationData.transformations.length - 1;
      console.log('🔄 Previous navigation: from', prev, 'to', newIndex);
      return newIndex;
    });
  };

  const goToNext = () => {
    console.log('🔄 Testimonial Navigation - Next clicked', {
      currentIndex,
      totalTestimonials: transformationData.transformations.length,
      willGoTo: currentIndex < transformationData.transformations.length - 1 ? currentIndex + 1 : 0
    });
    
    setCurrentIndex((prev) => {
      const newIndex = prev < transformationData.transformations.length - 1 ? prev + 1 : 0;
      console.log('🔄 Next navigation: from', prev, 'to', newIndex);
      return newIndex;
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Navigation arrows for testimonials - only show if multiple testimonials */}
        {hasMultiple && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-[45%] -translate-y-1/2 z-40 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-[45%] -translate-y-1/2 z-40 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                goToNext();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Current testimonial - Before/After Split */}
        <div className="aspect-square relative">
          <div className="grid grid-cols-2 gap-1 h-full">
            {/* Before Image */}
            <div className="relative overflow-hidden">
              <img
                src={currentTransformation.before}
                alt="Before transformation"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className="text-sm bg-black/70 text-white border-0 px-3 py-1">
                  Before
                </Badge>
              </div>
            </div>
            
            {/* After Image */}
            <div className="relative overflow-hidden">
              <img
                src={currentTransformation.after}
                alt="After transformation"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className="text-sm bg-success text-white border-0 px-3 py-1">
                  After
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Testimonial indicators - show which testimonial is active */}
        {hasMultiple && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex gap-1">
            {transformationData.transformations.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white shadow-sm' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        )}

        {/* Trainer Info & Current Testimonial Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 text-white drop-shadow-sm">
                {trainer.name}
              </h3>
              
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

          {/* Current Testimonial */}
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
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-success/20 text-success-foreground border-success/30">
                      {currentTransformation.achievement}
                    </Badge>
                    {hasMultiple && (
                      <span className="text-xs text-white/60">
                        {currentIndex + 1}/{transformationData.transformations.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};