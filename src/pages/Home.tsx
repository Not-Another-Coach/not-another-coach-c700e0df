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
import { supabase } from "@/integrations/supabase/client";
import { AppLogo } from "@/components/ui/app-logo";
import { EnhancedHeroSection } from "@/components/homepage/EnhancedHeroSection";
import { InteractiveValueCards } from "@/components/homepage/InteractiveValueCards";
import { QuickResetMenu } from "@/components/ui/QuickResetMenu";
import { ResetOptionsButton } from "@/components/ui/ResetOptionsButton";
import { ClientJourneyInfographic } from "@/components/homepage/ClientJourneyInfographic";

import { UserModeToggle } from "@/components/user-intent/UserModeToggle";
import { useUserIntent } from "@/hooks/useUserIntent";
import { Heart, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, loading, isLoggingOut } = useAuth();
  const { profile, loading: profileLoading, userType } = useProfileByType();
  const { user_type, loading: userTypeLoading } = useUserType();
  const { savedTrainersCount } = useAnonymousSession();
  const { setUserIntent, userIntent } = useUserIntent();
  const { isMigrating, migrationCompleted, migrationState } = useDataMigration();
  const navigate = useNavigate();
  
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  // Initialize data migration hook
  useDataMigration();

  // Set page title and reset trainer intent on home page
  useEffect(() => {
    document.title = "Home - Find Your Perfect Coach";
    
    // If user navigates back to home with trainer intent, reset to client view
    // This ensures the toggle matches the page content
    if (userIntent === 'trainer') {
      console.log('🔄 Resetting trainer intent to client on home page');
      setUserIntent('client');
    }
  }, [userIntent, setUserIntent]);

  // Redirect authenticated users based on their role and profile completion
  useEffect(() => {
    console.log('🔍 Home - Redirect Check:', {
      loading,
      profileLoading,
      userTypeLoading,
      isLoggingOut,
      isMigrating,
      hasUser: !!user,
      userType: userType || user_type,
      pathname: '/'
    });

    if (loading || profileLoading || userTypeLoading || isLoggingOut || isMigrating) {
      console.log('⏳ Home - Still loading, waiting...');
      return;
    }

    // Only redirect if user is authenticated
    if (!user) {
      console.log('✅ Home - No user, staying on home page');
      setIsCheckingRedirect(false);
      return;
    }

    // Wait for migration to complete if in progress
    if (isMigrating) {
      console.log('⏳ Home - Migration in progress, waiting...');
      return;
    }

    const currentUserType = userType || user_type;
    console.log('🔄 Home - Redirecting based on user type:', currentUserType);

    // Redirect based on user type
    if (currentUserType === 'trainer') {
      // Check if trainer profile is complete
      if (profile && 'bio' in profile) {
        const trainerProfile = profile as any;
        const isProfileComplete = trainerProfile.bio && 
                                 trainerProfile.specializations && 
                                 trainerProfile.specializations.length > 0;
        
        if (isProfileComplete) {
          console.log('✅ Home - Trainer profile complete, redirecting to dashboard');
          navigate('/trainer/dashboard', { replace: true });
        } else {
          console.log('📝 Home - Trainer profile incomplete, redirecting to setup');
          navigate('/trainer/profile-setup', { replace: true });
        }
      } else {
        console.log('📝 Home - No trainer profile, redirecting to setup');
        navigate('/trainer/profile-setup', { replace: true });
      }
    } else if (currentUserType === 'client') {
      // Check if client has completed survey OR has progressed beyond survey stage
      if (profile && 'client_survey_completed' in profile) {
        // Check engagement data to see if client has progressed beyond survey
        const checkEngagementAndRedirect = async () => {
          const { data: engagements } = await supabase
            .from('client_trainer_engagement')
            .select('stage, discovery_completed_at, became_client_at')
            .eq('client_id', user.id);

          // If client has advanced engagements, they've implicitly completed survey
          const hasAdvancedEngagement = engagements?.some(
            e => e.stage === 'discovery_completed' || 
                 e.stage === 'matched' || 
                 e.stage === 'active_client' ||
                 e.discovery_completed_at !== null ||
                 e.became_client_at !== null
          );

          const surveyCompleted = profile.client_survey_completed || hasAdvancedEngagement;
          
          if (surveyCompleted) {
            console.log('✅ Home - Client survey complete or has advanced engagement, redirecting to dashboard');
            navigate('/client/dashboard', { replace: true });
          } else {
            console.log('📝 Home - Client survey incomplete, redirecting to survey');
            navigate('/client-survey', { replace: true });
          }
        };

        checkEngagementAndRedirect();
      } else {
        console.log('📝 Home - No client profile data, redirecting to survey');
        navigate('/client-survey', { replace: true });
      }
    } else if (currentUserType === 'admin') {
      console.log('🔄 Home - Admin user, redirecting to admin');
      navigate('/admin', { replace: true });
    }

    // Set isCheckingRedirect to false after a small delay to ensure state settles
    if (!loading && !profileLoading && !userTypeLoading && !isLoggingOut && !isMigrating) {
      setTimeout(() => setIsCheckingRedirect(false), 100);
    }
  }, [user, loading, profileLoading, userTypeLoading, isLoggingOut, isMigrating, userType, user_type, profile, navigate]);

  const handleQuizComplete = (results: any) => {
    console.log('🎯 Quiz completed in Home component:', results);
    setShowQuizModal(false);
    // Set user intent to 'client' to prevent intent modal from showing again
    setUserIntent('client');
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

  // Show loading while checking auth status or during migration
  if (loading || (user && (profileLoading || userTypeLoading)) || isMigrating || isCheckingRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">
          {isMigrating ? 'Setting up your profile...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // Render home page for everyone
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Logo + Toggle */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <AppLogo onClick={() => navigate('/')} />
              <div className="hidden md:flex">
                <UserModeToggle />
              </div>
            </div>
          
            {/* Right side: Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
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
              
              {/* Desktop: Separate buttons */}
              <Button variant="ghost" onClick={() => navigate('/auth')} className="hidden md:flex">
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth?signup=client')} className="hidden md:flex">
                Join
              </Button>
              
              {/* Mobile: Single pill button */}
              <Button onClick={() => navigate('/auth?signup=client')} className="md:hidden">
                Join
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Toggle - Below header */}
        <div className="md:hidden border-t py-2 px-4">
          <div className="flex justify-center">
            <UserModeToggle />
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <EnhancedHeroSection 
        onFindMatch={() => navigate('/auth?signup=client')}
        showFindMatchButton={true}
        buttonText="Start Your Coaching Journey"
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

      {/* Client Journey Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClientJourneyInfographic />
        </div>
      </section>

      {/* Why Choose Our Platform */}
      <InteractiveValueCards />

      {/* Simple Coach Recruitment Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Are You a Coach? Grow Your Business With Us
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join the platform that connects you with serious clients and helps you build the coaching business you've always wanted.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/trainer/demo')}
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Become Not Another Coach Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Quiz Modal */}
      <MatchQuizModal 
        isOpen={showQuizModal}
        onComplete={handleQuizComplete}
        onClose={() => setShowQuizModal(false)}
      />
    </div>
  );
}