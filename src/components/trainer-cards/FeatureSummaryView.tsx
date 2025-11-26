import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Users, Crown, Sparkles } from "lucide-react";
import { AnyTrainer } from "@/types/trainer";
import { getTrainerDisplayPrice } from "@/lib/priceUtils";
import { getServiceIcon, standardizeServiceName, getServiceHighlight } from "@/lib/serviceIcons";
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwareRating } from "@/components/ui/VisibilityAwareRating";
import { VisibilityAwareText } from "@/components/ui/VisibilityAwareText";
import { VisibilityAwareBasicInfo } from "@/components/ui/VisibilityAwareBasicInfo";
import { VisibilityAwareImage } from "@/components/ui/VisibilityAwareImage";
import { isDemoTrainerId } from '@/config/demoTrainers';

interface FeatureSummaryViewProps {
  trainer: AnyTrainer;
  children?: React.ReactNode; // For CTA buttons and interactive elements
}

export const FeatureSummaryView = ({ trainer, children }: FeatureSummaryViewProps) => {
  // Detect if this is a demo trainer
  const isDemoProfile = trainer.id.startsWith('demo-trainer-') || isDemoTrainerId(trainer.id);
  
  const { stage: engagementStage, isGuest } = useEngagementStage(trainer.id);
  const { canViewContent, getVisibility } = useContentVisibility({
    engagementStage,
    isGuest
  });
  
  // Override visibility for demo profiles
  const effectiveDescriptionVisibility = isDemoProfile ? 'visible' : getVisibility('description_bio');
  
  // Get and standardize specialties for feature cards
  const allSpecialties = ((trainer as any).specializations || (trainer as any).specialties || []);
  const topSpecialties = allSpecialties.slice(0, 3).map((specialty: string) => ({
    name: standardizeServiceName(specialty),
    original: specialty,
    icon: getServiceIcon(specialty),
    highlight: getServiceHighlight(specialty, allSpecialties)
  }));
  
  // Get and standardize training types for display
  const allTrainingTypes = ((trainer as any).trainingTypes || (trainer as any).trainingType || []);
  const trainingTypes = allTrainingTypes.slice(0, 2).map((type: string) => ({
    name: standardizeServiceName(type),
    original: type,
    icon: getServiceIcon(type),
    highlight: getServiceHighlight(type, allTrainingTypes)
  }));

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Interactive elements overlay */}
        {children}
        
        {/* Feature Cards Grid - Full Height */}
        <div className="relative aspect-square">
          {/* Gradient overlay for card aesthetics */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
          
          <div className="h-full p-4 pb-20 relative z-10">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Specialties Cards */}
              {topSpecialties.map((specialty, index) => {
                const IconComponent = specialty.icon;
                const isHighlighted = specialty.highlight;
                
                return (
                  <div 
                    key={specialty.original}
                    className={`
                      relative rounded-xl p-4 text-center transition-all duration-200 hover:scale-105
                      ${isHighlighted === 'popular' 
                        ? 'bg-gradient-to-br from-primary/15 to-primary/25 border-2 border-primary/40 shadow-lg shadow-primary/20' 
                        : isHighlighted === 'specialist'
                        ? 'bg-gradient-to-br from-accent/15 to-accent/25 border-2 border-accent/40 shadow-lg shadow-accent/20'
                        : 'bg-gradient-to-br from-muted/40 to-muted/60 border border-muted-foreground/20 hover:border-primary/30'
                      }
                    `}
                  >
                    {/* Highlight Badge */}
                    {isHighlighted && (
                      <div className="absolute -top-2 -right-2">
                        <Badge 
                          variant="secondary" 
                          className={`
                            text-xs px-2 py-1 text-white border-0 shadow-sm
                            ${isHighlighted === 'popular' 
                              ? 'bg-primary' 
                              : 'bg-accent'
                            }
                          `}
                        >
                          {isHighlighted === 'popular' ? (
                            <><Crown className="h-3 w-3 mr-1" />Popular</>
                          ) : (
                            <><Sparkles className="h-3 w-3 mr-1" />Specialist</>
                          )}
                        </Badge>
                      </div>
                    )}
                    
                    <IconComponent 
                      className={`
                        h-6 w-6 mx-auto mb-2
                        ${isHighlighted === 'popular' 
                          ? 'text-primary' 
                          : isHighlighted === 'specialist'
                          ? 'text-accent'
                          : 'text-muted-foreground'
                        }
                      `} 
                    />
                    <div 
                      className={`
                        text-sm font-medium leading-tight
                        ${isHighlighted === 'popular' 
                          ? 'text-primary' 
                          : isHighlighted === 'specialist'
                          ? 'text-accent'
                          : 'text-foreground'
                        }
                      `}
                    >
                      {specialty.name}
                    </div>
                  </div>
                );
              })}
              
              {/* Training Type Cards */}
              {trainingTypes.map((trainingType, index) => {
                const IconComponent = trainingType.icon;
                const isHighlighted = trainingType.highlight;
                
                return (
                  <div 
                    key={trainingType.original}
                    className={`
                      relative rounded-xl p-4 text-center transition-all duration-200 hover:scale-105
                      ${isHighlighted === 'popular' 
                        ? 'bg-gradient-to-br from-success/15 to-success/25 border-2 border-success/40 shadow-lg shadow-success/20' 
                        : isHighlighted === 'specialist'
                        ? 'bg-gradient-to-br from-accent/15 to-accent/25 border-2 border-accent/40 shadow-lg shadow-accent/20'
                        : 'bg-gradient-to-br from-muted/40 to-muted/60 border border-muted-foreground/20 hover:border-success/30'
                      }
                    `}
                  >
                    {/* Highlight Badge */}
                    {isHighlighted && (
                      <div className="absolute -top-2 -right-2">
                        <Badge 
                          variant="secondary" 
                          className={`
                            text-xs px-2 py-1 text-white border-0 shadow-sm
                            ${isHighlighted === 'popular' 
                              ? 'bg-success' 
                              : 'bg-accent'
                            }
                          `}
                        >
                          {isHighlighted === 'popular' ? (
                            <><Crown className="h-3 w-3 mr-1" />Popular</>
                          ) : (
                            <><Sparkles className="h-3 w-3 mr-1" />Specialist</>
                          )}
                        </Badge>
                      </div>
                    )}
                    
                    <IconComponent 
                      className={`
                        h-6 w-6 mx-auto mb-2
                        ${isHighlighted === 'popular' 
                          ? 'text-success' 
                          : isHighlighted === 'specialist'
                          ? 'text-accent'
                          : 'text-muted-foreground'
                        }
                      `} 
                    />
                    <div 
                      className={`
                        text-sm font-medium leading-tight
                        ${isHighlighted === 'popular' 
                          ? 'text-success' 
                          : isHighlighted === 'specialist'
                          ? 'text-accent'
                          : 'text-foreground'
                        }
                      `}
                    >
                      {trainingType.name}
                    </div>
                  </div>
                );
              })}
              
              {/* Availability Card */}
              <div className="rounded-xl p-4 text-center bg-gradient-to-br from-muted/40 to-muted/60 border border-muted-foreground/20 hover:border-accent/30 transition-all duration-200 hover:scale-105">
                <Clock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm font-medium text-foreground leading-tight">
                  {trainer.availability}
                </div>
              </div>
            </div>

            {/* Additional specialties if any */}
            {((trainer as any).specializations || (trainer as any).specialties || []).length > 3 && (
              <div className="mt-3 flex justify-center">
                <Badge variant="outline" className="text-xs">
                  +{((trainer as any).specializations || (trainer as any).specialties || []).length - 3} more specialties
                </Badge>
              </div>
            )}

            {/* Description */}
            <VisibilityAwareText
              visibilityState={effectiveDescriptionVisibility}
              className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-4 border border-muted-foreground/10 backdrop-blur-sm mt-3"
              placeholder="Bio unlocks as you engage"
            >
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                {trainer.description}
              </p>
            </VisibilityAwareText>
          </div>
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Experience Badge Only */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {trainer.experience}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};