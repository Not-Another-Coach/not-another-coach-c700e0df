import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { MessagingPopup } from '@/components/MessagingPopup';
import { useRealTrainers } from '@/hooks/useRealTrainers';
import { ProfileViewSelector, ProfileViewMode } from '@/components/profile-views/ProfileViewSelector';
import { OverviewView } from '@/components/profile-views/OverviewView';
import { ResultsView } from '@/components/profile-views/ResultsView';
import { StoryView } from '@/components/profile-views/StoryView';
import { ContentView } from '@/components/profile-views/ContentView';
import { CardsView } from '@/components/profile-views/CardsView';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

export const TrainerProfile = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();
  const { trainers, loading } = useRealTrainers();
  const { user } = useAuth();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ProfileViewMode>('overview');
  const isMobile = useIsMobile();

  const trainer = trainers.find(t => t.id === trainerId);
  const isOwnProfile = user?.id === trainerId;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Trainer Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The trainer you're looking for doesn't exist or may have been removed.
              </p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleMessage = () => {
    setIsMessagingOpen(true);
  };

  const handleBookDiscovery = () => {
    // Implement discovery call booking
    console.log('Book discovery call for trainer:', trainer.id);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <OverviewView 
            trainer={trainer} 
            onMessage={!isOwnProfile ? handleMessage : undefined}
            onBookDiscovery={!isOwnProfile && trainer.offers_discovery_call ? handleBookDiscovery : undefined}
          />
        );
      case 'cards':
        return <CardsView trainer={trainer} />;
      case 'results':
        return <ResultsView trainer={trainer} />;
      case 'story':
        return <StoryView trainer={trainer} />;
      case 'content':
        return <ContentView trainer={trainer} />;
      case 'compare':
        // For individual profile, show message about comparison
        return (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold mb-2">Comparison Mode</h3>
              <p className="text-muted-foreground text-center max-w-md">
                To compare trainers, visit your saved or shortlisted trainers and select multiple trainers for comparison.
              </p>
              <Button 
                onClick={() => navigate('/saved-trainers')} 
                className="mt-4"
                variant="outline"
              >
                View Saved Trainers
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return <OverviewView trainer={trainer} onMessage={!isOwnProfile ? handleMessage : undefined} onBookDiscovery={!isOwnProfile ? handleBookDiscovery : undefined} />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{trainer.name}</h1>
          <p className="text-muted-foreground">
            {isOwnProfile ? 'Your Profile Preview' : 'Personal Trainer Profile'}
          </p>
        </div>
      </div>

      {/* Profile View Selector */}
      <div className="mb-6">
        <ProfileViewSelector
          currentView={currentView}
          onViewChange={setCurrentView}
          isMobile={isMobile}
        />
      </div>

      {/* Dynamic Content Based on View */}
      {renderCurrentView()}

      {/* Messaging Popup */}
      <MessagingPopup 
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
    </div>
  );
};