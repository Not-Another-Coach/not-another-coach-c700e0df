import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ChevronRight, Eye } from 'lucide-react';
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

  // Removed carousel scrolling logic - now using grid layout

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
        
        {/* Enhanced Empty State matching the explore design */}
        <Card className="text-center py-16 px-6 relative overflow-hidden">
          <CardContent className="p-0">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              {/* Animated Icon */}
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center shadow-lg">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
              </div>

              {/* Progress badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted/50 text-muted-foreground">
                  Your fitness journey starts here
                </span>
              </div>

              {/* Main content */}
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Let's find a trainer that matches your goals 💪
              </h3>
              
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Browse through our curated trainers and start building your fitness journey
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => onTabChange('explore')}
                  size="lg"
                  className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Trainers
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onTabChange('my-trainers')}
        >
          View All
        </Button>
      </div>

      <Card className="p-4">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTrainers.map((trainer) => (
              <EnhancedTrainerCard
                key={trainer.id}
                trainer={trainer as AnyTrainer}
                config="grid"
                cardState={getCardState(trainer.id)}
                onViewProfile={handleViewProfile}
                onStartConversation={handleMessage}
                onBookDiscoveryCall={handleBookDiscoveryCall}
                trainerOffersDiscoveryCalls={true}
                initialView="instagram"
                compactActions={false}
                hideViewControls={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}