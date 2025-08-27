import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Quote } from "lucide-react";
import { Trainer } from "@/components/TrainerCard";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";

interface ClientTransformationViewProps {
  trainer: Trainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
}

// Mock transformation data - in real app, this would come from trainer's results/testimonials
const getTransformationData = (trainer: Trainer) => {
  // This would be fetched from the trainer's testimonials/results data
  return {
    transformations: [
      {
        before: trainer.image, // Placeholder - would be actual before images
        after: trainer.image,   // Placeholder - would be actual after images
        clientName: "Sarah M.",
        testimonial: "Amazing results in just 3 months! I feel stronger and more confident than ever before.",
        achievement: "Lost 25lbs & gained strength"
      },
      {
        before: trainer.image,
        after: trainer.image,
        clientName: "Mike T.",
        testimonial: "The personalized approach made all the difference. Highly recommend!",
        achievement: "Built lean muscle"
      },
      {
        before: trainer.image,
        after: trainer.image,
        clientName: "Emma K.",
        testimonial: "Life-changing experience. Thank you for helping me reach my goals!",
        achievement: "Total transformation"
      }
    ]
  };
};

export const ClientTransformationView = ({ trainer, children }: ClientTransformationViewProps) => {
  const transformationData = getTransformationData(trainer);
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Transformation Gallery Grid */}
        <div className="relative">
          {/* Single Before/After Split */}
          <div className="aspect-square relative">
            <div className="grid grid-cols-2 gap-1 h-full">
              {/* Before Image */}
              <div className="relative overflow-hidden">
                <img
                  src={transformationData.transformations[0]?.before || trainer.image}
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
                  src={transformationData.transformations[0]?.after || trainer.image}
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
          </div>
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Trainer Info & Testimonial Overlay */}
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

          {/* Featured Testimonial */}
          {transformationData.transformations.length > 0 && (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-start gap-2">
                <Quote className="h-3 w-3 text-white/70 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white/90 italic mb-1 leading-relaxed">
                    "{transformationData.transformations[0].testimonial}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">
                      - {transformationData.transformations[0].clientName}
                    </span>
                    <Badge className="text-xs bg-success/20 text-success-foreground border-success/30">
                      {transformationData.transformations[0].achievement}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};