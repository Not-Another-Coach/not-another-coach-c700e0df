import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, TrendingUp, Trophy, Users, ArrowRight } from "lucide-react";
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
    totalTransformations: trainer.reviews || 24,
    averageResults: "15% body fat reduction",
    keyAchievements: [
      "Weight Loss",
      "Muscle Gain",
      "Strength"
    ],
    beforeAfterImages: [
      {
        before: trainer.image, // Placeholder - would be actual before images
        after: trainer.image,   // Placeholder - would be actual after images
        achievement: "Lost 30lbs"
      },
      // Would have more transformation images
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
        
        {/* Header with stats */}
        <div className="relative bg-gradient-to-r from-success/10 to-energy/10 p-4 border-b border-success/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-success/30"
              />
              <div>
                <h3 className="font-bold text-lg text-foreground">{trainer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span>{trainer.rating}</span>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>{trainer.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {getTrainerDisplayPrice(trainer)}
              </div>
              <div className="text-xs text-muted-foreground">packages</div>
            </div>
          </div>
          
          {/* Results Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/50 rounded-lg p-2 border border-success/20">
              <div className="text-lg font-bold text-success">{transformationData.totalTransformations}+</div>
              <div className="text-xs text-muted-foreground">Transformations</div>
            </div>
            <div className="bg-white/50 rounded-lg p-2 border border-energy/20">
              <div className="text-lg font-bold text-energy">15%</div>
              <div className="text-xs text-muted-foreground">Avg. Results</div>
            </div>
            <div className="bg-white/50 rounded-lg p-2 border border-primary/20">
              <div className="text-lg font-bold text-primary">{trainer.experience}</div>
              <div className="text-xs text-muted-foreground">Experience</div>
            </div>
          </div>
        </div>

        {/* Transformation Preview */}
        <div className="p-4">
          {transformationData.beforeAfterImages.length > 0 ? (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Client Transformations</span>
              </div>
              
              {/* Before/After Showcase */}
              <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-3 border">
                <div className="flex items-center gap-3">
                  {/* Before Image */}
                  <div className="text-center">
                    <div className="w-16 h-20 bg-muted rounded-lg mb-1 flex items-center justify-center border">
                      <img
                        src={transformationData.beforeAfterImages[0].before}
                        alt="Before"
                        className="w-full h-full object-cover rounded-lg opacity-70"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Before</div>
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                  
                  {/* After Image */}
                  <div className="text-center">
                    <div className="w-16 h-20 bg-success/10 rounded-lg mb-1 flex items-center justify-center border border-success/30">
                      <img
                        src={transformationData.beforeAfterImages[0].after}
                        alt="After"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="text-xs text-success font-medium">After</div>
                  </div>
                  
                  {/* Achievement Text */}
                  <div className="flex-1 ml-3">
                    <div className="text-sm font-medium text-foreground">
                      {transformationData.beforeAfterImages[0].achievement}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Real client result
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback - Achievement badges */
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Proven Results</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {transformationData.keyAchievements.map((achievement, index) => (
                  <div 
                    key={achievement}
                    className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-lg p-2 text-center"
                  >
                    <Trophy className="h-3 w-3 mx-auto text-success mb-1" />
                    <div className="text-xs font-medium text-success">{achievement}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Specialties */}
          <div className="flex gap-1 flex-wrap justify-center">
            {trainer.specialties.slice(0, 3).map((specialty) => (
              <Badge 
                key={specialty} 
                variant="outline" 
                className="text-xs border-primary/30 text-primary"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};