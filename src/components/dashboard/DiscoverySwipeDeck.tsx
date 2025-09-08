import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MessageCircle, Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedTrainerData } from '@/hooks/useUnifiedTrainerData';
import { useDataSynchronization } from '@/hooks/useDataSynchronization';

interface DiscoverySwipeDeckProps {
  profile: any;
}

export function DiscoverySwipeDeck({ profile }: DiscoverySwipeDeckProps) {
  const navigate = useNavigate();
  const { loadingState, markTrainersLoaded, markEngagementLoaded } = useDataSynchronization();
  const { 
    trainers, 
    loading, 
    saveTrainer, 
    unsaveTrainer, 
    shortlistTrainer, 
    removeFromShortlist,
    filterTrainers
  } = useUnifiedTrainerData();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Filter trainers to show those suitable for discovery
  const availableTrainers = trainers.filter(trainer => 
    trainer.engagementStage === 'browsing' && 
    trainer.offersDiscoveryCall
  ).slice(0, 10); // Limit to 10 for performance

  useEffect(() => {
    if (!loading) {
      markTrainersLoaded();
      markEngagementLoaded();
    }
  }, [loading, markTrainersLoaded, markEngagementLoaded]);

  const currentTrainer = availableTrainers[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentTrainer) return;

    setSwipeDirection(direction);
    
    if (direction === 'right') {
      // Save trainer
      await saveTrainer(currentTrainer.id);
    }
    
    // Move to next trainer after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleMessage = () => {
    if (!currentTrainer) return;
    
    const event = new CustomEvent('openMessagePopup', {
      detail: { trainerId: currentTrainer.id }
    });
    window.dispatchEvent(event);
  };

  const handleShortlist = async () => {
    if (!currentTrainer) return;
    
    if (currentTrainer.engagementStage === 'shortlisted') {
      await removeFromShortlist(currentTrainer.id);
    } else {
      await shortlistTrainer(currentTrainer.id);
    }
  };

  const handleViewProfile = () => {
    if (!currentTrainer) return;
    navigate(`/trainer/${currentTrainer.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Discover Trainers</h2>
        <Card className="h-96 bg-gradient-to-br from-muted to-secondary-50">
          <CardContent className="flex items-center justify-center h-full">
            <div className="animate-pulse text-center">
              <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-32 mx-auto mb-2" />
              <div className="h-3 bg-muted rounded w-24 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentTrainer || currentIndex >= availableTrainers.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Discover Trainers</h2>
        <Card className="h-96 bg-gradient-to-br from-secondary-50 to-accent-50">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                You've seen all available trainers!
              </h3>
              <p className="text-muted-foreground mb-4">
                Check back later for new trainers or explore your saved ones.
              </p>
              <Button onClick={() => navigate('/my-trainers')}>
                View My Trainers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Discover Trainers</h2>
        <Badge variant="outline" className="text-sm">
          {currentIndex + 1} of {availableTrainers.length}
        </Badge>
      </div>

      <div className="relative">
        <Card 
          className={`h-96 overflow-hidden transition-transform duration-300 cursor-pointer ${
            swipeDirection === 'left' 
              ? 'transform -translate-x-full opacity-50' 
              : swipeDirection === 'right'
              ? 'transform translate-x-full opacity-50'
              : ''
          }`}
          onClick={handleViewProfile}
        >
          <CardContent className="p-0 relative h-full">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={currentTrainer.profilePhotoUrl || '/placeholder.svg'} 
                alt={currentTrainer.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
            </div>

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                {currentTrainer.offersDiscoveryCall && (
                  <Badge variant="secondary">
                    Available for Discovery Call
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-1">{currentTrainer.name}</h3>
                
                {currentTrainer.specializations && currentTrainer.specializations.length > 0 && (
                  <p className="text-lg text-white/90 mb-2">
                    {currentTrainer.specializations.slice(0, 2).join(' • ')}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-white/80">
                  {currentTrainer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{currentTrainer.location}</span>
                    </div>
                  )}
                  
                  {currentTrainer.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{currentTrainer.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12 p-0 bg-white/20 border-white/30 hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('left');
                  }}
                >
                  <X className="h-6 w-6 text-white" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12 p-0 bg-white/20 border-white/30 hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessage();
                  }}
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12 p-0 bg-white/20 border-white/30 hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShortlist();
                  }}
                >
                  <Star className={`h-6 w-6 ${
                    currentTrainer.engagementStage === 'shortlisted' 
                      ? 'text-warning-400 fill-current' 
                      : 'text-white'
                  }`} />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12 p-0 bg-primary-500/80 border-primary-400 hover:bg-primary-600/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('right');
                  }}
                >
                  <Heart className="h-6 w-6 text-white" />
                </Button>
              </div>

              <div className="text-center mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile();
                  }}
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Swipe Instructions */}
        <div className="flex justify-center mt-4 gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4" />
            <span>Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Message</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Shortlist</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Save</span>
          </div>
        </div>
      </div>
    </div>
  );
}