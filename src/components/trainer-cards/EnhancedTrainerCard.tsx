import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, X, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Trainer } from "@/components/TrainerCard";
import { TrainerCardViewMode } from "./TrainerCardViewSelector";
import { InstagramGalleryView } from "./InstagramGalleryView";
import { FeatureSummaryView } from "./FeatureSummaryView";
import { ClientTransformationView } from "./ClientTransformationView";
import { MatchBadge } from "@/components/MatchBadge";
import { Badge } from "@/components/ui/badge";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useNavigate } from "react-router-dom";

interface EnhancedTrainerCardProps {
  trainer: Trainer;
  onViewProfile?: (trainerId: string) => void;
  onMessage?: (trainerId: string) => void;
  matchScore?: number;
  matchReasons?: string[];
  
  // Unified state management
  cardState?: 'saved' | 'shortlisted' | 'discovery' | 'matched' | 'declined' | 'waitlist' | 'default';
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
  waitlistRefreshKey?: number;
  
  // Management actions
  onMoveToSaved?: (trainerId: string) => void;
  onRemoveCompletely?: (trainerId: string) => void;
  
  // View control
  initialView?: TrainerCardViewMode;
}

export const EnhancedTrainerCard = ({ 
  trainer,
  onViewProfile,
  onMessage,
  matchScore = 0,
  matchReasons = [],
  cardState = 'default',
  showComparisonCheckbox = false,
  comparisonChecked = false,
  onComparisonToggle,
  comparisonDisabled = false,
  showRemoveButton = false,
  onRemove,
  onAddToShortlist,
  onStartConversation,
  onBookDiscoveryCall,
  onEditDiscoveryCall,
  onProceedWithCoach,
  onRejectCoach,
  isShortlisted = false,
  hasDiscoveryCall = false,
  discoveryCallData,
  trainerOffersDiscoveryCalls = false,
  waitlistRefreshKey = 0,
  onMoveToSaved,
  onRemoveCompletely,
  initialView = 'features'
}: EnhancedTrainerCardProps) => {
  const navigate = useNavigate();
  const { isTrainerSaved, saveTrainer, unsaveTrainer } = useSavedTrainers();
  const [currentView, setCurrentView] = useState<TrainerCardViewMode>(initialView);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use trainer-specific saved state
  const isSaved = isTrainerSaved(trainer.id);

  // Available views in order
  const views: TrainerCardViewMode[] = ['instagram', 'features', 'transformations'];
  const currentViewIndex = views.indexOf(currentView);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = isSaved 
        ? await unsaveTrainer(trainer.id)
        : await saveTrainer(trainer.id);
      console.log(`Save/unsave result for ${trainer.id}:`, success);
    } catch (error) {
      console.error('Error in handleToggleSave:', error);
    }
  };

  const handleComparisonClick = (checked: boolean) => {
    if (onComparisonToggle) {
      onComparisonToggle(trainer.id);
    }
  };

  const handleRemoveClick = () => {
    if (onRemove) {
      onRemove(trainer.id);
    }
  };

  // Navigation functions
  const goToPreviousView = () => {
    const currentIndex = views.indexOf(currentView);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
    setCurrentView(views[previousIndex]);
  };

  const goToNextView = () => {
    const currentIndex = views.indexOf(currentView);
    const nextIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
    setCurrentView(views[nextIndex]);
  };

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextView();
    }
    if (isRightSwipe) {
      goToPreviousView();
    }
  };

  // Get the appropriate state badge based on card state
  const getStateBadge = () => {
    switch (cardState) {
      case 'matched':
        return {
          text: "💚 Mutual Match!",
          className: "bg-success text-success-foreground"
        };
      case 'shortlisted':
        return {
          text: "⭐ Shortlisted",
          className: "bg-accent text-accent-foreground"
        };
      case 'discovery':
        return {
          text: "🔍 Discovery",
          className: "bg-primary text-primary-foreground"
        };
      case 'saved':
        return {
          text: "💾 Saved",
          className: "bg-secondary text-secondary-foreground"
        };
      case 'declined':
        return {
          text: "❌ Declined",
          className: "bg-destructive text-destructive-foreground"
        };
      case 'waitlist':
        return {
          text: "⏰ On Waitlist",
          className: "bg-warning text-warning-foreground"
        };
      default:
        return null;
    }
  };

  const stateBadge = getStateBadge();

  // Create interactive elements overlay
  const interactiveElements = (
    <>
      {/* Top row: Interactive elements */}
      <div className="absolute top-2 left-2 right-2 flex justify-between z-20">
        {/* Left: Heart/Save button with management dropdown */}
        <div className="flex items-center gap-1">
          {showRemoveButton ? (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 backdrop-blur hover:bg-destructive/10 hover:text-destructive"
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
                <Heart className="h-4 w-4 text-destructive fill-current" />
              ) : (
                <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
              )}
            </Button>
          )}
          
          {/* Management dropdown */}
          {(cardState === 'shortlisted' || cardState === 'discovery') && (onMoveToSaved || onRemoveCompletely) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-8 w-8"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {onMoveToSaved && (
                  <DropdownMenuItem onClick={() => onMoveToSaved(trainer.id)}>
                    <Heart className="h-3 w-3 mr-2" />
                    Move to Saved
                  </DropdownMenuItem>
                )}
                {onRemoveCompletely && (
                  <DropdownMenuItem 
                    onClick={() => onRemoveCompletely(trainer.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3 mr-2" />
                    Remove Completely
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

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

      {/* State badge */}
      {stateBadge && (
        <div className="absolute top-12 left-2 z-10">
          <Badge className={`text-xs ${stateBadge.className}`}>
            {stateBadge.text}
          </Badge>
        </div>
      )}

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-15 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          goToPreviousView();
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-15 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          goToNextView();
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* View indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-15 flex gap-1">
        {views.map((view, index) => (
          <button
            key={view}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentViewIndex 
                ? 'bg-white shadow-sm' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentView(view);
            }}
          />
        ))}
      </div>

      {/* Click handler for profile navigation */}
      <div 
        className="absolute inset-0 z-5 cursor-pointer" 
        onClick={() => navigate(`/trainer/${trainer.id}`)}
        title="View trainer profile"
      />
    </>
  );

  // Render current view with interactive elements
  const renderCurrentView = () => {
    switch (currentView) {
      case 'instagram':
        return (
          <InstagramGalleryView trainer={trainer}>
            {interactiveElements}
          </InstagramGalleryView>
        );
      case 'transformations':
        return (
          <ClientTransformationView trainer={trainer}>
            {interactiveElements}
          </ClientTransformationView>
        );
      case 'features':
      default:
        return (
          <FeatureSummaryView trainer={trainer}>
            {interactiveElements}
          </FeatureSummaryView>
        );
    }
  };

  return (
    <div 
      ref={cardRef}
      className="relative select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Enhanced Trainer Card */}
      {renderCurrentView()}
    </div>
  );
};