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
import { QuickResetMenu } from "@/components/ui/QuickResetMenu";
import { ResetOptionsButton } from "@/components/ui/ResetOptionsButton";

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
    if (loading || profileLoading || userTypeLoading || isLoggingOut || isMigrating) {
      return;
    }

    // Only redirect if user is authenticated
    if (!user) {
      return;
    }

    // Wait for migration to complete if in progress
    if (isMigrating) {
      return;
    }

    const currentUserType = userType || user_type;

    // Redirect based on user type
    if (currentUserType === 'trainer') {
      // Check if trainer profile is complete
      if (profile && 'bio' in profile) {
        const trainerProfile = profile as any;
        const isProfileComplete = trainerProfile.bio && 
                                 trainerProfile.specializations && 
                                 trainerProfile.specializations.length > 0;
        
        if (isProfileComplete) {
          navigate('/trainer/dashboard', { replace: true });
        } else {
          navigate('/trainer/profile-setup', { replace: true });
        }
      } else {
        navigate('/trainer/profile-setup', { replace: true });
      }
    } else if (currentUserType === 'client') {
      navigate('/client/dashboard', { replace: true });
    } else if (currentUserType === 'admin') {
      navigate('/admin', { replace: true });
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
  if (loading || (user && (profileLoading || userTypeLoading)) || isMigrating) {
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
          <div className="flex items-center justify-between h-16 relative">
            <div className="flex-shrink-0">
              <AppLogo onClick={() => navigate('/')} />
            </div>
            
            {/* User Mode Toggle - Center */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
              <UserModeToggle />
            </div>
          
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
              
              {/* Reset Options Menu - always show if intent is set */}
              {userIntent && (
                <ResetOptionsButton 
                  variant="ghost" 
                  size="sm"
                />
              )}
              
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth?signup=client')}>
                Create Account
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
        onFindMatch={() => setShowQuizModal(true)}
      />

      {/* Meet The Coaches Section */}
      <section id="browse-trainers" className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl font-bold">Meet The Coaches</h2>
              {userIntent && (
                <ResetOptionsButton 
                  variant="outline" 
                  size="sm"
                />
              )}
            </div>
            <p className="text-xl text-muted-foreground">
              Discover your perfect training match
            </p>
          </div>
          
          <AnonymousBrowse />
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
            Become a Coach Today
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