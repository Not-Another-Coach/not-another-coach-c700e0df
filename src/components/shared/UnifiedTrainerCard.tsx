import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Heart, MapPin, Star, Users, Calendar, MessageCircle, Award, Eye } from "lucide-react";
import { VisibilityAwareBasicInfo } from "@/components/ui/VisibilityAwareBasicInfo";
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';

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
  const navigate = useNavigate();
  
  // Add visibility logic for basic information
  const { stage, isGuest } = useEngagementStage(trainer.id);
  const { getVisibility } = useContentVisibility({
    engagementStage: stage || 'browsing',
    isGuest
  });
  
  console.log('🎯 UnifiedTrainerCard rendering:', { trainer: trainer.first_name + ' ' + trainer.last_name, showMatchScore, className });
  console.log('🎯 Trainer data:', { 
    hourly_rate: trainer.hourly_rate, 
    free_discovery_call: trainer.free_discovery_call,
    specializations: trainer.specializations?.length,
    rating: trainer.rating 
  });

  const handleViewProfile = () => {
    navigate(`/trainer/${trainer.id}`);
  };
  
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
            <VisibilityAwareBasicInfo
              name={`${trainer.first_name} ${trainer.last_name}`}
              tagline={trainer.tagline}
              location={trainer.location}
              visibilityState={getVisibility('basic_information')}
              className="mb-2"
            />
            
            {/* Rating */}
            {trainer.rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{trainer.rating.toFixed(1)}</span>
                <span className="text-xs">({trainer.total_ratings})</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              £{trainer.hourly_rate || 0}
            </div>
            <div className="text-xs text-muted-foreground">/hour</div>
          </div>
        </div>

        {/* Specialisations */}
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
            onClick={handleViewProfile}
          >
            <Eye className="h-4 w-4" />
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