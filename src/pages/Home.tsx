import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileByType } from "@/hooks/useProfileByType";
import { useUserType } from "@/hooks/useUserType";
import { useDataMigration } from "@/hooks/useDataMigration";
import { AnonymousBrowse } from "@/components/anonymous/AnonymousBrowse";
import { MatchQuiz } from "@/components/anonymous/MatchQuiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { AppLogo } from "@/components/ui/app-logo";
import { EnhancedHeroSection } from "@/components/homepage/EnhancedHeroSection";
import { InteractiveValueCards } from "@/components/homepage/InteractiveValueCards";
import { TrainerPreviewCarousel } from "@/components/homepage/TrainerPreviewCarousel";
import { SocialProofSection } from "@/components/homepage/SocialProofSection";
import { CoachRecruitmentSection } from "@/components/homepage/CoachRecruitmentSection";
import { UserIntentModal } from "@/components/user-intent/UserIntentModal";
import { useUserIntent } from "@/hooks/useUserIntent";
import { Heart } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, userType } = useProfileByType();
  const { user_type, loading: userTypeLoading } = useUserType();
  const { savedTrainersCount } = useAnonymousSession();
  const { shouldShowModal, setUserIntent, clearIntent, dismissModal } = useUserIntent();
  const navigate = useNavigate();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  // Initialize data migration hook
  useDataMigration();

  useEffect(() => {
    // If user is authenticated, redirect to appropriate dashboard
    if (!loading && !profileLoading && !userTypeLoading && user) {
      if (profile && user_type) {
        if (user_type === 'trainer') {
          if (profile.profile_setup_completed && profile.terms_agreed) {
            navigate('/trainer/dashboard');
          } else {
            navigate('/trainer/profile-setup');
          }
        } else if (user_type === 'client') {
          if (!profile.client_survey_completed) {
            navigate('/client-survey');
          } else {
            navigate('/client/dashboard');
          }
        } else if (user_type === 'admin') {
          navigate('/admin');
        }
      }
    }
  }, [user, profile, loading, profileLoading, userTypeLoading, user_type, navigate]);

  const handleQuizComplete = (results: any) => {
    setShowQuiz(false);
    setShowMatches(true);
  };

  const handleIntentSelection = (intent: 'client' | 'trainer') => {
    console.log('Intent selected:', intent);
    setUserIntent(intent);
    
    // Navigate based on intent
    if (intent === 'trainer') {
      console.log('Navigating to /trainer/demo');
      navigate('/trainer/demo');
    } else if (intent === 'client') {
      // Scroll to browse trainers section for clients
      setTimeout(() => {
        document.getElementById('browse-trainers')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  // Show loading only while checking auth status
  if (loading || (user && (profileLoading || userTypeLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show anonymous experience for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* User Intent Modal */}
        <UserIntentModal 
          isOpen={shouldShowModal}
          onSelectIntent={handleIntentSelection}
          onDismiss={dismissModal}
        />
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <AppLogo />
            
              <div className="flex items-center gap-4">
                {savedTrainersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/anonymous-saved')}
                    className="gap-2"
                  >
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                    {savedTrainersCount} saved
                  </Button>
                )}
                
                {/* Reset Intent Button - for testing */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearIntent}
                  className="text-xs"
                >
                  Reset Intent
                </Button>
                
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth?signup=client')}>
                   Create Account
                  </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Hero Section */}
        <EnhancedHeroSection 
          onFindMatch={() => {
            setShowQuiz(true);
            setTimeout(() => {
              document.getElementById('browse-trainers')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }, 100);
          }}
          onBrowseAll={() => document.getElementById('browse-trainers')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* Featured Trainers Preview - moved after hero */}
        <TrainerPreviewCarousel onViewAll={() => document.getElementById('browse-trainers')?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Why Choose Our Platform */}
        <InteractiveValueCards />

        {/* Coach Recruitment Section */}
        <CoachRecruitmentSection onBecomeCoach={() => navigate('/trainer/demo')} />

        {/* Browse Trainers Section */}
        <section id="browse-trainers" className="py-16 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Browse Trainers</h2>
              <p className="text-xl text-muted-foreground">
                Discover your perfect training match
              </p>
            </div>
            
            {savedTrainersCount > 0 && (
              <Card className="mb-6">
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
                  <div className="text-sm sm:text-base">
                    You have {savedTrainersCount} saved {savedTrainersCount === 1 ? 'trainer' : 'trainers'}. Create an account to keep them forever.
                  </div>
                  <Button onClick={() => navigate('/auth?signup=client')}>Create Account</Button>
                </CardContent>
              </Card>
            )}
            
            {showQuiz ? (
              <MatchQuiz 
                onComplete={handleQuizComplete}
                onClose={() => setShowQuiz(false)}
              />
            ) : (
              <AnonymousBrowse />
            )}
          </div>
        </section>
      </div>
    );
  }

  // Fallback for authenticated users (shouldn't reach here due to useEffect redirect)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
}