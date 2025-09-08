import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, X, MoreVertical, ChevronLeft, ChevronRight, MessageCircle, Calendar, Star, Eye } from "lucide-react";
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
  initialView = 'instagram'
}: EnhancedTrainerCardProps) => {
  const navigate = useNavigate();
  const { isTrainerSaved, saveTrainer, unsaveTrainer } = useSavedTrainers();
  const [currentView, setCurrentView] = useState<TrainerCardViewMode>(initialView);
  
  // Update internal state when initialView prop changes
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use trainer-specific saved state
  const isSaved = isTrainerSaved(trainer.id);

  // Available views in order - dynamically add transformation views for each testimonial
  const getAvailableViews = (): TrainerCardViewMode[] => {
    const baseViews: TrainerCardViewMode[] = ['instagram', 'features'];
    
    // Get testimonials for this trainer
    const testimonials = ((trainer as any).testimonials || []);
    const filteredTestimonials = testimonials.filter((t: any) => t.showImages && t.beforeImage && t.afterImage && t.consentGiven);
    
    // Add a transformation view for each testimonial
    if (filteredTestimonials.length > 0) {
      filteredTestimonials.forEach((_, index) => {
        baseViews.push(`transformations-${index}` as TrainerCardViewMode);
      });
    } else {
      // If no testimonials, still add one transformations view
      baseViews.push('transformations');
    }
    
    return baseViews;
  };

  const views = getAvailableViews();
  const currentViewIndex = views.indexOf(currentView as any);

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

  // Render contextual action buttons based on state and available handlers
  const renderActionButtons = () => {
    const buttons = [];

    // Always show View Profile button
    buttons.push(
      <Button
        key="view-profile"
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          if (onViewProfile) {
            onViewProfile(trainer.id);
          } else {
            navigate(`/trainer/${trainer.id}`);
          }
        }}
        className="flex-1"
      >
        <Eye className="w-4 h-4 mr-2" />
        View Profile
      </Button>
    );

    // Show different buttons based on card state
    switch (cardState) {
      case 'shortlisted':
        if (trainerOffersDiscoveryCalls && onBookDiscoveryCall && !hasDiscoveryCall) {
          buttons.unshift(
            <Button
              key="book-call"
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookDiscoveryCall(trainer.id);
              }}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Call
            </Button>
          );
        }
        if (onStartConversation) {
          buttons.unshift(
            <Button
              key="message"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartConversation(trainer.id);
              }}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          );
        }
        break;

      case 'discovery':
        if (hasDiscoveryCall && onEditDiscoveryCall) {
          buttons.unshift(
            <Button
              key="edit-call"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditDiscoveryCall(trainer.id);
              }}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Edit Call
            </Button>
          );
        }
        if (onStartConversation) {
          buttons.unshift(
            <Button
              key="message"
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartConversation(trainer.id);
              }}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          );
        }
        break;

      case 'matched':
        if (onStartConversation) {
          buttons.unshift(
            <Button
              key="message"
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartConversation(trainer.id);
              }}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          );
        }
        break;

      default:
        // For saved or default state, show shortlist button if available
        if (onAddToShortlist && !isShortlisted) {
          buttons.unshift(
            <Button
              key="shortlist"
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToShortlist(trainer.id);
              }}
              className="flex-1"
            >
              <Star className="w-4 h-4 mr-2" />
              Add to Shortlist
            </Button>
          );
        }
        if (onStartConversation) {
          buttons.unshift(
            <Button
              key="message"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartConversation(trainer.id);
              }}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          );
        }
        break;
    }

    return buttons;
  };

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

      {/* Navigation arrows - ALWAYS show view navigation arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          goToPreviousView();
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          goToNextView();
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* View indicators - prevent event propagation */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1">
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
              e.preventDefault();
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
    // Check if current view is a transformation view with index
    if (currentView.startsWith('transformations-')) {
      const testimonialIndex = parseInt(currentView.split('-')[1]);
      return (
        <ClientTransformationView trainer={trainer} testimonialIndex={testimonialIndex}>
          {interactiveElements}
        </ClientTransformationView>
      );
    }
    
    switch (currentView) {
      case 'instagram':
        return (
          <InstagramGalleryView trainer={trainer}>
            {interactiveElements}
          </InstagramGalleryView>
        );
      case 'transformations':
        return (
          <ClientTransformationView trainer={trainer} testimonialIndex={0}>
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
      
      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8">
        <div className="flex gap-2">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};