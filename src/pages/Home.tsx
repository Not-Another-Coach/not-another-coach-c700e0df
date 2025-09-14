import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileByType } from "@/hooks/useProfileByType";
import { useUserType } from "@/hooks/useUserType";
import { useDataMigration } from "@/hooks/useDataMigration";
import { AnonymousBrowse } from "@/components/anonymous/AnonymousBrowse";
import { MatchQuizModal } from "@/components/anonymous/MatchQuizModal";
import { Button } from "@/components/ui/button";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { AppLogo } from "@/components/ui/app-logo";
import { EnhancedHeroSection } from "@/components/homepage/EnhancedHeroSection";
import { InteractiveValueCards } from "@/components/homepage/InteractiveValueCards";
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
  
  const [showQuizModal, setShowQuizModal] = useState(false);

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
    setShowQuizModal(false);
    // Scroll to browse trainers section to show filtered results
    setTimeout(() => {
      const browseSection = document.getElementById('browse-trainers');
      if (browseSection) {
        browseSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleIntentSelection = (intent: 'client' | 'trainer') => {
    if (intent === 'client') {
      setShowQuizModal(true);
    } else {
      navigate('/trainer/demo');
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
                    className="gap-2 animate-scale-in hover-scale"
                    key={savedTrainersCount} // Force re-render for animation
                  >
                    <Heart className="h-4 w-4 fill-primary text-primary animate-pulse" />
                    <span className="animate-fade-in">
                      {savedTrainersCount} saved
                    </span>
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
          onFindMatch={() => setShowQuizModal(true)}
        />

        {/* Meet The Coaches Section */}
        <section id="browse-trainers" className="py-16 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet The Coaches</h2>
              <p className="text-xl text-muted-foreground">
                Discover your perfect training match
              </p>
            </div>
            
            <AnonymousBrowse />
          </div>
        </section>

        {/* Why Choose Our Platform */}
        <InteractiveValueCards />

        {/* Coach Recruitment Section */}
        <CoachRecruitmentSection onBecomeCoach={() => navigate('/trainer/demo')} />

        {/* Quiz Modal */}
        <MatchQuizModal 
          isOpen={showQuizModal}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuizModal(false)}
        />
      </div>
    );
  }

  return <div>Redirecting...</div>;
}