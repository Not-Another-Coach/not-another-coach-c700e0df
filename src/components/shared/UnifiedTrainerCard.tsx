import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Heart, MapPin, Star, Users, Calendar, MessageCircle, Award } from "lucide-react";

interface UnifiedTrainer {
  id: string;
  first_name: string;
  last_name: string;
  tagline: string;
  location: string;
  specializations: string[];
  coaching_style?: string[];
  rating: number;
  total_ratings: number;
  profile_photo_url: string;
  hourly_rate: number | null;
  free_discovery_call: boolean | null;
  match_score?: number;
}

interface UnifiedTrainerCardProps {
  trainer: UnifiedTrainer;
  onSave: (trainerId: string) => void;
  onMessage: (trainerId: string) => void;
  onBook: (trainerId: string) => void;
  isSaved: boolean;
  isAuthenticated?: boolean;
  showMatchScore?: boolean;
  className?: string;
}

export const UnifiedTrainerCard = ({
  trainer,
  onSave,
  onMessage,
  onBook,
  isSaved,
  isAuthenticated = false,
  showMatchScore = false,
  className = ""
}: UnifiedTrainerCardProps) => {
  console.log('🎯 UnifiedTrainerCard rendering:', { trainer: trainer.first_name + ' ' + trainer.last_name, showMatchScore, className });
  console.log('🎯 Trainer data:', { 
    hourly_rate: trainer.hourly_rate, 
    free_discovery_call: trainer.free_discovery_call,
    specializations: trainer.specializations?.length,
    rating: trainer.rating 
  });
  
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-primary/20 ${className}`}>
      <CardContent className="p-6">
        {/* Header with Match Score */}
        {showMatchScore && trainer.match_score && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Match Score</span>
              <span className="text-lg font-bold text-primary">
                {trainer.match_score}%
              </span>
            </div>
            <Progress value={trainer.match_score} className="h-2" />
          </div>
        )}

        {/* Trainer Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={trainer.profile_photo_url} />
              <AvatarFallback>
                {trainer.first_name?.[0]}{trainer.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-1">
              <Award className="h-3 w-3" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {trainer.first_name} {trainer.last_name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {trainer.tagline}
            </p>
            
            {/* Location and Rating */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{trainer.location}</span>
              </div>
              {trainer.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{trainer.rating.toFixed(1)}</span>
                  <span className="text-xs">({trainer.total_ratings})</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              £{trainer.hourly_rate || 0}
            </div>
            <div className="text-xs text-muted-foreground">/hour</div>
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {trainer.specializations?.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {trainer.specializations?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trainer.specializations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Coaching Style */}
        {trainer.coaching_style?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Coaching Style:</p>
            <p className="text-sm">
              {trainer.coaching_style.slice(0, 2).join(', ')}
              {trainer.coaching_style.length > 2 && '...'}
            </p>
          </div>
        )}

        {/* Discovery Call Badge */}
        {trainer.free_discovery_call === true && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              Free discovery call available
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => onSave(trainer.id)}
            disabled={isSaved}
          >
            <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage(trainer.id)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBook(trainer.id)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};