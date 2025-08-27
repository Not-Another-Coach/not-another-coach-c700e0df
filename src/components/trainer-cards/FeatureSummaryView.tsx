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
        
        {/* Header with trainer image and basic info */}
        <div className="relative p-4 pb-2">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-secondary/20"
              />
              {trainer.certifications.length > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-1">
                  <Award className="h-3 w-3" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground mb-1 truncate">
                {trainer.name}
              </h3>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="font-medium">{trainer.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{trainer.location}</span>
                </div>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                {trainer.experience}
              </Badge>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {getTrainerDisplayPrice(trainer)}
              </div>
              <div className="text-xs text-muted-foreground">package</div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Specialties Cards */}
            {topSpecialties.map((specialty, index) => (
              <div 
                key={specialty}
                className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3 text-center"
              >
                <Target className="h-4 w-4 mx-auto text-primary mb-1" />
                <div className="text-xs font-medium text-primary">{specialty}</div>
              </div>
            ))}
            
            {/* Training Type Card */}
            {trainingTypes.length > 0 && (
              <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-lg p-3 text-center">
                <Users className="h-4 w-4 mx-auto text-success mb-1" />
                <div className="text-xs font-medium text-success">
                  {trainingTypes.join(' & ')}
                </div>
              </div>
            )}
            
            {/* Availability Card */}
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-lg p-3 text-center">
              <Clock className="h-4 w-4 mx-auto text-accent mb-1" />
              <div className="text-xs font-medium text-accent truncate">
                {trainer.availability}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/30 rounded-lg p-3 border border-muted-foreground/10">
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
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
      </CardContent>
    </Card>
  );
};