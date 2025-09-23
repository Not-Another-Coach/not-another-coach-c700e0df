import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Calendar } from 'lucide-react';
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
import { EnhancedTrainerCard } from '@/components/trainer-cards/EnhancedTrainerCard';
import { AnonymousProfileCard } from '@/components/profile-cards/AnonymousProfileCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { AppLogo } from '@/components/ui/app-logo';

export const TrainerProfile = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { user_type, isClient } = useUserTypeChecks();
  const [searchParams] = useSearchParams();
  const fromSource = searchParams.get('from');
  
  const includeOwnUnpublished = useMemo(() => 
    user?.id ? { userId: user.id } : undefined, 
    [user?.id]
  );
  
  const { trainers, loading } = useRealTrainers(undefined, includeOwnUnpublished);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ProfileViewMode>('overview');
  const isMobile = useIsMobile();

  const handleBackNavigation = () => {
    try {
      // Handle context-aware navigation based on where user came from
      if (fromSource === 'dropdown') {
        // Came from "View Public Profile" in dropdown - go to dashboard
        if (user?.id === trainerId) {
          navigate('/trainer/dashboard');
        } else {
          navigate('/my-trainers'); // For viewing other trainer's profile
        }
      } else if (fromSource === 'profile-setup') {
        // Came from profile settings - go back to profile setup
        navigate('/trainer/profile-setup');
      } else {
        // Check if we're coming from My Trainers or client context
        const referrer = document.referrer;
        if (referrer.includes('/my-trainers') || referrer.includes('/client/') || isClient()) {
          // Client viewing trainer profile - go back to My Trainers
          navigate('/my-trainers');
        } else if (user?.id === trainerId) {
          // Own profile view - go to appropriate dashboard
          navigate('/trainer/dashboard');
        } else {
          // Default: go to my trainers for clients, trainer dashboard for trainers
          navigate(isClient() ? '/my-trainers' : '/trainer/dashboard');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      navigate(isClient() ? '/my-trainers' : '/trainer/dashboard');
    }
  };

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
              <Button onClick={() => navigate('/my-trainers')}>
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
    // Prevent anonymous users from accessing content view
    if (!user && currentView === 'content') {
      setCurrentView('overview');
      return (
        <OverviewView 
          trainer={trainer} 
          onMessage={!isOwnProfile ? handleMessage : undefined}
          onBookDiscovery={!isOwnProfile && trainer.offers_discovery_call ? handleBookDiscovery : undefined}
        />
      );
    }

    switch (currentView) {
      case 'overview':
        return (
          <OverviewView 
            trainer={trainer} 
            onMessage={!isOwnProfile ? handleMessage : undefined}
            onBookDiscovery={!isOwnProfile && trainer.offers_discovery_call ? handleBookDiscovery : undefined}
          />
        );
      case 'results':
        return <ResultsView trainer={trainer} />;
      case 'story':
        return <StoryView trainer={trainer} />;
      case 'content':
        // Only show content view to authenticated users
        return user ? <ContentView trainer={trainer} /> : (
          <OverviewView 
            trainer={trainer} 
            onMessage={!isOwnProfile ? handleMessage : undefined}
            onBookDiscovery={!isOwnProfile && trainer.offers_discovery_call ? handleBookDiscovery : undefined}
          />
        );
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
    <div className="min-h-screen bg-background">
      {/* Header for anonymous users */}
      {!user && (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <AppLogo onClick={() => navigate('/')} />
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth?signup=true')}>
                  Join Free
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackNavigation}
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

        {/* Profile Card for non-owner users */}
        {!isOwnProfile && (
          <div className="mb-6">
            {!user ? (
              // Anonymous users get the specialized anonymous profile card
              <AnonymousProfileCard
                trainer={trainer}
                onMessage={() => navigate('/auth')}
                onBookDiscovery={() => navigate('/auth')}
              />
            ) : (
              // Authenticated users get the enhanced trainer card
              <EnhancedTrainerCard
                trainer={trainer}
                layout="full"
                initialView="instagram"
                allowViewSwitching={true}
                showEngagementBadge={false}
                compactActions={false}
                hideViewControls={false}
                onViewProfile={() => {}} // Already on profile page
                onMessage={handleMessage}
                onAddToShortlist={() => console.log('Add to shortlist')}
                onStartConversation={handleMessage}
                onBookDiscoveryCall={handleBookDiscovery}
                trainerOffersDiscoveryCalls={trainer.offers_discovery_call || false}
              />
            )}
          </div>
        )}

        {/* Card Preview - Only for own profile */}
        {isOwnProfile && (
          <div className="mb-6">
            <CardsView trainer={trainer} />
          </div>
        )}

        {/* Profile View Selector - Available for all users */}
        <div className="mb-6">
          <ProfileViewSelector
            currentView={currentView}
            onViewChange={setCurrentView}
            isMobile={isMobile}
            hideCardsView={true} // Always hide cards view for non-owners
            hideCompareView={true}
            hideDescriptions={true}
            hideViewingBadge={true}
          />
        </div>

        {/* Dynamic Content Based on View - Available for all users */}
        {renderCurrentView()}

        {/* Messaging Popup */}
        <MessagingPopup 
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      </div>
    </div>
  );
};