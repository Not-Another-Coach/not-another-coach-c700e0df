import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, X, MoreVertical, ChevronLeft, ChevronRight, MessageCircle, Calendar, Star, Eye } from "lucide-react";
import { Trainer } from "@/components/TrainerCard";
import { InstagramGalleryView } from "./InstagramGalleryView";
import { FeatureSummaryView } from "./FeatureSummaryView";
import { ClientTransformationView } from "./ClientTransformationView";
import { MatchBadge } from "@/components/MatchBadge";
import { Badge } from "@/components/ui/badge";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useNavigate } from "react-router-dom";
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { AnyTrainer, TrainerCardLayout, UnifiedTrainerCardProps, TRAINER_CARD_CONFIGS, TrainerCardViewMode } from '@/types/trainer';
import { cn } from '@/lib/utils';

// Extended interface that merges UnifiedTrainerCardProps with specific props
interface EnhancedTrainerCardProps extends Omit<UnifiedTrainerCardProps, 'trainer'> {
  trainer: AnyTrainer;
  
  // Additional layout configuration
  config?: string; // Key from TRAINER_CARD_CONFIGS
}

export const EnhancedTrainerCard = memo(({ 
  trainer,
  layout = 'full',
  config,
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
  initialView = 'instagram',
  allowViewSwitching = true,
  showEngagementBadge = false,
  compactActions = false,
  hideViewControls = false
}: EnhancedTrainerCardProps) => {
  const navigate = useNavigate();
  const { isTrainerSaved, saveTrainer, unsaveTrainer } = useSavedTrainers();
  
  // Apply configuration if provided
  const appliedConfig = useMemo(() => 
    config ? TRAINER_CARD_CONFIGS[config] : null, 
    [config]
  );
  
  const finalLayout = appliedConfig?.layout || layout;
  const finalAllowViewSwitching = appliedConfig?.allowViewSwitching ?? allowViewSwitching;
  const finalShowEngagementBadge = appliedConfig?.showEngagementBadge ?? showEngagementBadge;
  const finalCompactActions = appliedConfig?.compactActions ?? compactActions;
  const finalHideViewControls = appliedConfig?.hideViewControls ?? hideViewControls;
  
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

  // Add visibility context - this will be passed to sub-components through their own hooks
  const { stage } = useEngagementStage(trainer.id);
  const { canViewContent, loading: visibilityLoading } = useContentVisibility({
    trainerId: trainer.id,
    engagementStage: stage || 'browsing'
  });

  // Available views in order - memoized to prevent recalculation
  const getAvailableViews = useCallback((): TrainerCardViewMode[] => {
    // Use restricted views if provided in config
    if (appliedConfig?.availableViews) {
      return appliedConfig.availableViews;
    }
    
    const baseViews: TrainerCardViewMode[] = ['instagram', 'features'];
    
    // Get testimonials for this trainer (memoized)
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
  }, [appliedConfig?.availableViews, trainer]);

  const views = useMemo(() => getAvailableViews(), [getAvailableViews]);
  const currentViewIndex = views.indexOf(currentView as any);

  const handleToggleSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = isSaved 
        ? await unsaveTrainer(trainer.id)
        : await saveTrainer(trainer.id);
      console.log(`Save/unsave result for ${trainer.id}:`, success);
    } catch (error) {
      console.error('Error in handleToggleSave:', error);
    }
  }, [isSaved, unsaveTrainer, saveTrainer, trainer.id]);

  const handleComparisonClick = useCallback((checked: boolean) => {
    if (onComparisonToggle) {
      onComparisonToggle(trainer.id);
    }
  }, [onComparisonToggle, trainer.id]);

  const handleRemoveClick = useCallback(() => {
    if (onRemove) {
      onRemove(trainer.id);
    }
  }, [onRemove, trainer.id]);

  // Navigation functions - memoized
  const goToPreviousView = useCallback(() => {
    const currentIndex = views.indexOf(currentView);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
    setCurrentView(views[previousIndex]);
  }, [views, currentView]);

  const goToNextView = useCallback(() => {
    const currentIndex = views.indexOf(currentView);
    const nextIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
    setCurrentView(views[nextIndex]);
  }, [views, currentView]);

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
    if (!finalShowEngagementBadge) return null;
    
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

    // For carousel layout, show compact actions or no actions at all
    if (finalLayout === 'carousel' && finalCompactActions) {
      // Only show actions if handlers are provided
      if (onStartConversation) {
        buttons.push(
          <Button
            key="message"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onStartConversation(trainer.id);
            }}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </Button>
        );
      }
      
      if (trainerOffersDiscoveryCalls && onBookDiscoveryCall && !hasDiscoveryCall) {
        buttons.push(
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
            <Calendar className="w-4 h-4 mr-1" />
            Book Call
          </Button>
        );
      }
      
      // For carousel with no actions, return empty array
      return buttons.slice(0, 2); // Limit to 2 buttons for carousel
    }

    // Full layout actions (existing logic)
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

      {/* Navigation arrows - Show based on layout and config */}
      {finalAllowViewSwitching && !finalHideViewControls && (
        <>
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
        </>
      )}

      {/* View indicators - Show based on config */}
      {finalAllowViewSwitching && !finalHideViewControls && (
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
      )}

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

  // Render carousel-specific layout
  const renderCarouselView = () => {
    return (
      <Card className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-300 snap-start",
        "bg-gradient-to-br from-card to-secondary-50 h-80 overflow-hidden"
      )}>
        <CardContent className="p-0 h-full relative">
          {/* Main image/view content - Always show InstagramGalleryView for dashboard carousel */}
          <div className="h-48 relative overflow-hidden rounded-t-lg">
            <InstagramGalleryView trainer={trainer}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </InstagramGalleryView>
            
            {/* Top Badge */}
            {stateBadge && finalShowEngagementBadge && (
              <div className="absolute top-3 left-3">
                <Badge className={stateBadge.className}>
                  {stateBadge.text}
                </Badge>
              </div>
            )}

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h3 className="font-semibold text-lg mb-1 truncate">{trainer.name}</h3>
              {((trainer as any).specializations || trainer.specialties) && ((trainer as any).specializations || trainer.specialties)!.length > 0 && (
                <p className="text-sm text-white/80 truncate">
                  {((trainer as any).specializations || trainer.specialties)![0]}
                </p>
              )}
            </div>
          </div>

          {/* Content section */}
          <div className="p-4 flex flex-col justify-between h-32">
            <div className="flex items-center justify-between mb-2">
              {trainer.location && (
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {trainer.location}
                </p>
              )}
              {trainer.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="font-medium">{trainer.rating}</span>
                </div>
              )}
            </div>

            {/* Action Buttons - Only show if there are actions */}
            {renderActionButtons().length > 0 && (
              <div className="flex gap-2 mt-auto pt-2">
                {renderActionButtons()}
              </div>
            )}
          </div>

          {/* Interactive elements for carousel */}
          <div className="absolute top-2 left-2 right-2 flex justify-between z-20">
            {/* Left: Heart/Save button */}
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
            
            {/* Right: Match badge if available */}
            {matchScore > 0 && (
              <MatchBadge score={matchScore} reasons={matchReasons} />
            )}
          </div>

          {/* View navigation for carousel */}
          {finalAllowViewSwitching && views.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  goToPreviousView();
                }}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 backdrop-blur hover:bg-white/90 transition-all p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  goToNextView();
                }}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "relative select-none",
        finalLayout === 'carousel' && "min-w-[260px] max-w-[260px]",
        finalLayout === 'grid' && "w-full",
        finalLayout === 'compact' && "w-full max-w-sm"
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Enhanced Trainer Card */}
      {finalLayout === 'carousel' ? renderCarouselView() : renderCurrentView()}
      
      {/* Bottom Action Bar - Only show when there are actions to display */}
      {(finalLayout !== 'carousel' || !finalCompactActions) && renderActionButtons().length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6">
          <div className="flex gap-2">
            {renderActionButtons()}
          </div>
        </div>
      )}
    </div>
  );
});

// Display name for debugging
EnhancedTrainerCard.displayName = 'EnhancedTrainerCard';