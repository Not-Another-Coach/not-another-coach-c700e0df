import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, MapPin, Clock, Users, Award, Target, Dumbbell, Heart, X, MessageCircle, Calendar, ExternalLink } from "lucide-react";
import { MatchBadge } from "@/components/MatchBadge";
import { MatchProgressIndicator } from "@/components/MatchProgressIndicator";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useContentVisibility } from "@/hooks/useContentVisibility";
import { useEngagementStage } from "@/hooks/useEngagementStage";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useProfile } from "@/hooks/useProfile";
import { WaitlistJoinButton } from "@/components/waitlist/WaitlistJoinButton";
import { WaitlistStatusBadge } from "@/components/waitlist/WaitlistStatusBadge";
import { useNavigate } from "react-router-dom";

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
  offers_discovery_call?: boolean;
}

interface MatchDetail {
  category: string;
  score: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface TrainerCardProps {
  trainer: Trainer;
  onViewProfile?: (trainerId: string) => void;
  onMessage?: (trainerId: string) => void;
  matchScore?: number;
  matchReasons?: string[];
  matchDetails?: MatchDetail[];
  
  // Unified state management
  cardState?: 'saved' | 'shortlisted' | 'discovery' | 'matched' | 'default';
  showComparisonCheckbox?: boolean;
  comparisonChecked?: boolean;
  onComparisonToggle?: (trainerId: string) => void;
  comparisonDisabled?: boolean;
  showRemoveButton?: boolean;
  onRemove?: (trainerId: string) => void;
  
  // CTA actions
  onAddToShortlist?: (trainerId: string) => void;
  onStartConversation?: (trainerId: string) => void;
  onBookDiscoveryCall?: (trainerId: string) => void;
  onEditDiscoveryCall?: (trainerId: string) => void;
  onProceedWithCoach?: (trainerId: string) => void;
  onRejectCoach?: (trainerId: string) => void;
  isShortlisted?: boolean;
  hasDiscoveryCall?: boolean;
  discoveryCallData?: any;
  trainerOffersDiscoveryCalls?: boolean;
}

export const TrainerCard = ({ 
  trainer, 
  onViewProfile, 
  onMessage, 
  matchScore = 0, 
  matchReasons = [], 
  matchDetails = [],
  cardState = 'default',
  showComparisonCheckbox = false,
  comparisonChecked = false,
  onComparisonToggle,
  comparisonDisabled = false,
  showRemoveButton = false,
  onRemove,
  // CTA props
  onAddToShortlist,
  onStartConversation,
  onBookDiscoveryCall,
  onEditDiscoveryCall,
  onProceedWithCoach,
  onRejectCoach,
  isShortlisted = false,
  hasDiscoveryCall = false,
  discoveryCallData,
  trainerOffersDiscoveryCalls = false
}: TrainerCardProps) => {
  const navigate = useNavigate();
  const { isTrainerSaved, saveTrainer, unsaveTrainer } = useSavedTrainers();
  const { stage } = useEngagementStage(trainer.id);
  const { getVisibility } = useContentVisibility({
    trainerId: trainer.id,
    engagementStage: stage
  });
  const { getCoachAvailability, checkClientWaitlistStatus } = useWaitlist();
  const { profile } = useProfile();
  const [coachAvailability, setCoachAvailability] = useState<any>(null);
  const [clientWaitlistStatus, setClientWaitlistStatus] = useState<any>(null);
  
  // Use trainer-specific saved state instead of global check
  const isSaved = isTrainerSaved(trainer.id);
  const profileImageVisibility = getVisibility('profile_image');
  const isClient = profile?.user_type === 'client';
  
  // Mask name based on visibility settings
  const shouldShowName = profileImageVisibility === 'visible';
  const displayName = shouldShowName ? trainer.name : 'PT Professional';

  // Fetch coach availability and client waitlist status
  useEffect(() => {
    const fetchData = async () => {
      if (trainer.id) {
        const availability = await getCoachAvailability(trainer.id);
        setCoachAvailability(availability);
        
        if (isClient) {
          const waitlistStatus = await checkClientWaitlistStatus(trainer.id);
          setClientWaitlistStatus(waitlistStatus);
        }
      }
    };
    fetchData();
  }, [trainer.id, isClient, getCoachAvailability, checkClientWaitlistStatus]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🔥 HEART BUTTON CLICK DEBUG');
    console.log('🔥 Event object:', e);
    console.log(`🔥 Heart clicked for trainer ${trainer.id}, currently saved: ${isSaved}, cardState: ${cardState}`);
    console.log('🔥 About to call save/unsave function');
    
    try {
      const success = isSaved 
        ? await unsaveTrainer(trainer.id)
        : await saveTrainer(trainer.id);
      console.log(`🔥 Save/unsave result for ${trainer.id}:`, success);
    } catch (error) {
      console.error('🔥 Error in handleToggleSave:', error);
    }
  };

  const handleComparisonClick = (checked: boolean) => {
    console.log(`Comparison toggle for trainer ${trainer.id}:`, checked);
    if (onComparisonToggle) {
      onComparisonToggle(trainer.id);
    }
  };

  const handleRemoveClick = () => {
    if (onRemove) {
      onRemove(trainer.id);
    }
  };

  // Get match quality badge based on match score
  const getMatchQualityBadge = () => {
    if (matchScore >= 85) {
      return {
        text: "🎯 Great Match",
        className: "bg-green-500 text-white"
      };
    } else if (matchScore >= 70) {
      return {
        text: "✨ Good Match", 
        className: "bg-blue-500 text-white"
      };
    }
    return null;
  };

  // Get the appropriate state badge based on card state
  const getStateBadge = () => {
    switch (cardState) {
      case 'matched':
        return {
          text: "💚 Mutual Match!",
          className: "bg-green-500 text-white"
        };
      case 'shortlisted':
        return {
          text: "⭐ Shortlisted",
          className: "bg-yellow-500 text-white"
        };
      case 'discovery':
        return {
          text: "🔍 Discovery",
          className: "bg-blue-500 text-white"
        };
      case 'saved':
        return {
          text: "💾 Saved",
          className: "bg-purple-500 text-white"
        };
      default:
        return null;
    }
  };

  // Get all active badges for consistent layout
  const getActiveBadges = () => {
    const badges = [];
    const matchBadge = getMatchQualityBadge();
    const stateBadge = getStateBadge();
    
    // Always show state badge if available, regardless of match score
    if (stateBadge) badges.push(stateBadge);
    // Show match badge only if it meets threshold
    if (matchBadge) badges.push(matchBadge);
    
    return badges;
  };

  const activeBadges = getActiveBadges();

  // Debug logging for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log(`TrainerCard ${trainer.name}: cardState=${cardState}, matchScore=${matchScore}, badges=${activeBadges.length}`);
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30 border-0 relative overflow-hidden">
      <CardContent className="p-6 pt-20"> {/* Increased top padding to create space between labels and content */}
        {/* Line 1: Interactive elements */}
        <div className="absolute top-2 left-2 right-2 flex justify-between z-20">
          {/* Left: Heart/Save or Remove button */}
          {showRemoveButton ? (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 backdrop-blur hover:bg-red-50 hover:text-red-600"
              onClick={handleRemoveClick}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 backdrop-blur hover:bg-white/90 transition-all"
              onClick={handleToggleSave}
            >
              {isSaved || cardState === 'saved' ? (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              ) : (
                <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
              )}
            </Button>
          )}

          {/* Right: Comparison checkbox or Match badge */}
          {showComparisonCheckbox ? (
            <Checkbox
              id={`comparison-${trainer.id}`}
              checked={comparisonChecked}
              onCheckedChange={handleComparisonClick}
              disabled={comparisonDisabled}
              className="bg-white border-2 shadow-sm"
            />
          ) : matchScore > 0 ? (
            <MatchBadge score={matchScore} reasons={matchReasons} />
          ) : null}
        </div>

        {/* Line 2: Consistent badge layout - moved down to avoid overlap with X button */}
        {activeBadges.length > 0 && (
          <div className="absolute top-12 left-2 right-2 flex gap-2 flex-wrap z-10">
            {activeBadges.map((badge, index) => (
              <Badge key={index} className={`text-xs ${badge.className}`}>
                {badge.text}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Main content */}
        <div className="flex items-start gap-4 mb-4">
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
            <div 
              className="flex items-center gap-2 cursor-pointer group/name"
              onClick={() => navigate(`/trainer/${trainer.id}`)}
              title="View trainer profile"
            >
              <h3 className="font-semibold text-lg text-foreground group-hover/name:text-primary transition-colors">
                {displayName}
              </h3>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/name:text-primary transition-colors opacity-0 group-hover/name:opacity-100" />
            </div>
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


        {/* Waitlist Status Badge - Show if client is on waitlist */}
        {isClient && clientWaitlistStatus && (
          <div className="mb-4">
            <WaitlistStatusBadge coachId={trainer.id} />
          </div>
        )}

        {/* Match Score and Breakdown - Add back the match display */}
        {matchScore > 0 && (
          <div className="mb-4 space-y-3">
            {/* Match Percentage */}
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{matchScore}%</div>
              <div className="text-sm text-muted-foreground">Match</div>
            </div>
            
            {/* Match Breakdown/Reasons */}
            {matchReasons && matchReasons.length > 0 && (
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">Why this match:</div>
                <div className="space-y-1">
                  {matchReasons.slice(0, 3).map((reason, index) => (
                    <div key={index} className="text-xs text-foreground flex items-start">
                      <span className="text-primary mr-1">•</span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certifications */}
        <div className="text-xs text-muted-foreground mb-4">
          <strong>Certified:</strong> {trainer.certifications.join(", ")}
        </div>

      </CardContent>
    </Card>
  );
};