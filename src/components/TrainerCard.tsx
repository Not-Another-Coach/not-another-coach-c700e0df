import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, MapPin, Clock, Users, Award, Target, Dumbbell, Heart } from "lucide-react";
import { MatchBadge } from "@/components/MatchBadge";

export interface Trainer {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  hourlyRate: number;
  image: string;
  certifications: string[];
  description: string;
  availability: string;
  trainingType: string[];
}

interface MatchDetail {
  category: string;
  score: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface TrainerCardProps {
  trainer: Trainer;
  onViewProfile: (trainerId: string) => void;
  matchScore?: number;
  matchReasons?: string[];
  matchDetails?: MatchDetail[];
}

export const TrainerCard = ({ trainer, onViewProfile, matchScore = 0, matchReasons = [], matchDetails = [] }: TrainerCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-6">
        {/* Match Badge - Fixed positioning */}
        {matchScore > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <MatchBadge score={matchScore} reasons={matchReasons} />
          </div>
        )}
        {/* Trainer Image and Basic Info */}
        <div className="flex items-start gap-4 mb-4" style={{ marginTop: matchScore > 0 ? '2rem' : '0' }}>
          <div className="relative">
            <img 
              src={trainer.image} 
              alt={trainer.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-secondary/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-1">
              <Award className="h-3 w-3" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {trainer.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-medium">{trainer.rating}</span>
                <span className="text-muted-foreground">({trainer.reviews})</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{trainer.experience}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {trainer.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {trainer.availability}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${trainer.hourlyRate}</div>
            <div className="text-sm text-muted-foreground">per hour</div>
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {trainer.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trainer.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {trainer.description}
        </p>

        {/* Training Types */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {trainer.trainingType.map((type) => (
              <span key={type} className="text-xs bg-energy/10 text-energy px-2 py-1 rounded-full">
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Match Details - Visual indicators */}
        {matchDetails.length > 0 && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-primary/10">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Match Breakdown
            </h4>
            <div className="space-y-3">
              {matchDetails.map((detail, index) => {
                const IconComponent = detail.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-24 text-xs">
                      <IconComponent className={`h-3 w-3 ${detail.color}`} />
                      <span className="text-muted-foreground">{detail.category}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <Progress 
                        value={detail.score} 
                        className="h-2 flex-1"
                      />
                      <span className="text-xs font-medium w-8 text-right">{detail.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        <div className="text-xs text-muted-foreground">
          <strong>Certified:</strong> {trainer.certifications.join(", ")}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            Message
          </Button>
          <Button 
            variant="hero" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewProfile(trainer.id)}
          >
            View Profile
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};