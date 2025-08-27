import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award, Users, Clock, Dumbbell, Target } from "lucide-react";
import { Trainer } from "@/components/TrainerCard";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";

interface FeatureSummaryViewProps {
  trainer: Trainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
}

export const FeatureSummaryView = ({ trainer, children }: FeatureSummaryViewProps) => {
  // Get top 3 specialties for feature cards
  const topSpecialties = trainer.specialties.slice(0, 3);
  
  // Get training types for display
  const trainingTypes = trainer.trainingType.slice(0, 2);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Feature Cards Grid - Full Height */}
        <div className="relative aspect-square">
          <div className="h-full p-4 pb-20">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Specialties Cards */}
              {topSpecialties.map((specialty, index) => (
                <div 
                  key={specialty}
                  className="bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/30 rounded-lg p-4 text-center"
                >
                  <Target className="h-5 w-5 mx-auto text-primary mb-2" />
                  <div className="text-sm font-medium text-primary">{specialty}</div>
                </div>
              ))}
              
              {/* Training Type Card */}
              {trainingTypes.length > 0 && (
                <div className="bg-gradient-to-br from-success/10 to-success/20 border border-success/30 rounded-lg p-4 text-center">
                  <Users className="h-5 w-5 mx-auto text-success mb-2" />
                  <div className="text-sm font-medium text-success">
                    {trainingTypes.join(' & ')}
                  </div>
                </div>
              )}
              
              {/* Availability Card */}
              <div className="bg-gradient-to-br from-accent/10 to-accent/20 border border-accent/30 rounded-lg p-4 text-center">
                <Clock className="h-5 w-5 mx-auto text-accent mb-2" />
                <div className="text-sm font-medium text-accent">
                  {trainer.availability}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-muted/40 rounded-lg p-4 border border-muted-foreground/10">
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                {trainer.description}
              </p>
            </div>

            {/* Additional specialties if any */}
            {trainer.specialties.length > 3 && (
              <div className="mt-3 flex justify-center">
                <Badge variant="outline" className="text-xs">
                  +{trainer.specialties.length - 3} more specialties
                </Badge>
              </div>
            )}
          </div>
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
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
                
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {trainer.experience}
                </Badge>
              </div>
              
              {/* Price */}
              <div className="text-right">
                <div className="text-xl font-bold text-white drop-shadow-sm">
                  {getTrainerDisplayPrice(trainer)}
                </div>
                <div className="text-xs text-white/80">package</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};