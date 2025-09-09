import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useShortlistedTrainers } from '@/hooks/useShortlistedTrainers';
import { useUnifiedTrainerData } from '@/hooks/useUnifiedTrainerData';
import { EnhancedTrainerCard } from '@/components/trainer-cards/EnhancedTrainerCard';
import { AnyTrainer } from '@/types/trainer';

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

  const getCardState = (trainerId: string): 'saved' | 'shortlisted' | 'default' => {
    const isSaved = savedTrainers.some(saved => saved.trainer_id === trainerId);
    const isShortlisted = shortlistedTrainers.some(shortlisted => shortlisted.trainer_id === trainerId);
    
    if (isSaved && isShortlisted) {
      return 'shortlisted'; // Prioritize shortlisted if both
    } else if (isShortlisted) {
      return 'shortlisted';
    } else if (isSaved) {
      return 'saved';
    }
    return 'default';
  };

  const handleBookDiscoveryCall = (trainerId: string) => {
    // Navigate to booking flow
    navigate(`/trainer/${trainerId}?book-call=true`);
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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onTabChange('my-trainers')}
              className="text-xl font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              My Trainers
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange('my-trainers')}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onTabChange('my-trainers')}
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            My Trainers
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('my-trainers')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
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
        </div>
      </div>

      <div 
        id="trainers-carousel"
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {myTrainers.map((trainer) => (
          <div key={trainer.id} onClick={() => handleViewProfile(trainer.id)}>
            <EnhancedTrainerCard
              trainer={trainer as AnyTrainer}
              config="dashboardCarousel"
              cardState={getCardState(trainer.id)}
              onViewProfile={handleViewProfile}
              // Remove all action buttons - only allow profile viewing
              onStartConversation={undefined}
              onBookDiscoveryCall={undefined}
              trainerOffersDiscoveryCalls={false}
              initialView="instagram"
              // Hide bottom action bar completely
              compactActions={true}
              hideViewControls={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}