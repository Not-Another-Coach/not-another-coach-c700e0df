import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Star, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useShortlistedTrainers } from '@/hooks/useShortlistedTrainers';
import { useUnifiedTrainerData } from '@/hooks/useUnifiedTrainerData';

interface MyTrainersCarouselProps {
  onTabChange: (tab: string) => void;
}

export function MyTrainersCarousel({ onTabChange }: MyTrainersCarouselProps) {
  const navigate = useNavigate();
  const { savedTrainers } = useSavedTrainers();
  const { shortlistedTrainers } = useShortlistedTrainers();
  const { trainers, loading } = useUnifiedTrainerData();

  // Get trainers that are saved or shortlisted
  const myTrainers = trainers.filter(trainer => 
    savedTrainers.some(saved => saved.trainer_id === trainer.id) ||
    shortlistedTrainers.some(shortlisted => shortlisted.trainer_id === trainer.id)
  ).slice(0, 6); // Limit to 6 for carousel

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('trainers-carousel');
    if (carousel) {
      const scrollAmount = 280; // Width of card + gap
      carousel.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleViewProfile = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  const handleMessage = (trainerId: string) => {
    const event = new CustomEvent('openMessagePopup', {
      detail: { trainerId }
    });
    window.dispatchEvent(event);
  };

  const getEngagementBadge = (trainerId: string) => {
    const isSaved = savedTrainers.some(saved => saved.trainer_id === trainerId);
    const isShortlisted = shortlistedTrainers.some(shortlisted => shortlisted.trainer_id === trainerId);
    
    if (isSaved && isShortlisted) {
      return <Badge variant="secondary" className="text-xs">Saved & Shortlisted</Badge>;
    } else if (isSaved) {
      return <Badge variant="outline" className="text-xs">Saved</Badge>;
    } else if (isShortlisted) {
      return <Badge variant="default" className="text-xs">Shortlisted</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">My Trainers</h2>
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[260px] h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (myTrainers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">My Trainers</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onTabChange('explore')}
          >
            Discover Trainers
          </Button>
        </div>
        <Card className="p-8 text-center bg-gradient-to-br from-muted to-secondary-50">
          <CardContent>
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No trainers saved yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start exploring to find and save trainers you're interested in.
            </p>
            <Button onClick={() => onTabChange('explore')}>
              Explore Trainers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">My Trainers</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollCarousel('left')}
            className="rounded-full w-8 h-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollCarousel('right')}
            className="rounded-full w-8 h-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onTabChange('my-trainers')}
          >
            View All
          </Button>
        </div>
      </div>

      <div 
        id="trainers-carousel"
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {myTrainers.map((trainer) => (
          <Card 
            key={trainer.id}
            className="min-w-[260px] cursor-pointer hover:shadow-lg transition-all duration-300 snap-start bg-gradient-to-br from-card to-secondary-50"
            onClick={() => handleViewProfile(trainer.id)}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img 
                  src={trainer.profilePhotoUrl || '/placeholder.svg'} 
                  alt={trainer.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-3 left-3">
                  {getEngagementBadge(trainer.id)}
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-semibold text-lg mb-1 truncate">{trainer.name}</h3>
                  {trainer.specializations && trainer.specializations.length > 0 && (
                    <p className="text-sm text-white/80 truncate">
                      {trainer.specializations[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessage(trainer.id);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  
                  {trainer.offersDiscoveryCall && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to booking flow
                        navigate(`/trainer/${trainer.id}?book-call=true`);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book Call
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}