import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useEnhancedTrainerMatching } from "@/hooks/useEnhancedTrainerMatching";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { SimpleHeroSection } from "@/components/SimpleHeroSection";

import { FilterSection } from "@/components/FilterSection";
import { VisualSwipeSection } from "@/components/VisualSwipeSection";
import { ProgressBreadcrumb } from "@/components/ProgressBreadcrumb";
import { TrainerCard, Trainer } from "@/components/TrainerCard";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Button } from "@/components/ui/button";
import { Edit, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";
import trainerAlex from "@/assets/trainer-alex.jpg";

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { profile, loading: profileLoading, isAdmin, isTrainer, isClient } = useProfile();
  const { savedTrainerIds } = useSavedTrainers();
  const { progress: journeyProgress, updateProgress, advanceToStage } = useJourneyProgress();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to auth if not logged in
  useEffect(() => {
    console.log('Checking auth redirect:', { loading, user: !!user });
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect clients to onboarding quiz if not completed
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && isClient() && !profile.quiz_completed) {
      navigate('/onboarding');
    }
  }, [user, profile, loading, profileLoading, isClient, navigate]);

  // Redirect trainers to their dashboard or profile setup (only from Index page)
  useEffect(() => {
    console.log('Checking trainer redirect:', { 
      loading, 
      profileLoading, 
      user: !!user, 
      profile: !!profile, 
      userType: profile?.user_type,
      isTrainer: isTrainer(),
      currentPath: location.pathname
    });
    
    // Only redirect trainers if they're currently on the index page
    if (!loading && !profileLoading && user && profile && isTrainer() && location.pathname === '/') {
      console.log('Redirecting trainer to dashboard');
      // Check if profile setup is needed
      if (!profile.terms_agreed || !(profile as any).profile_setup_completed) {
        navigate('/trainer/profile-setup');
      } else {
        navigate('/trainer/dashboard');
      }
    }
  }, [user, profile, loading, profileLoading, isTrainer, navigate, location.pathname]);

  // Sample trainer data
  const [trainers] = useState<Trainer[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      specialties: ["Weight Loss", "Strength Training", "Nutrition"],
      rating: 4.9,
      reviews: 127,
      experience: "8 years",
      location: "Downtown",
      hourlyRate: 85,
      image: trainerSarah,
      certifications: ["NASM-CPT", "Precision Nutrition"],
      description: "Passionate about helping clients achieve sustainable weight loss and building strength. Specializes in creating personalized workout plans that fit your lifestyle.",
      availability: "Mon-Fri",
      trainingType: ["In-Person", "Online"]
    },
    {
      id: "2", 
      name: "Mike Rodriguez",
      specialties: ["Muscle Building", "Powerlifting", "Sports Performance"],
      rating: 4.8,
      reviews: 94,
      experience: "12 years",
      location: "Westside",
      hourlyRate: 95,
      image: trainerMike,
      certifications: ["CSCS", "USAPL Coach"],
      description: "Former competitive powerlifter dedicated to helping clients build serious muscle and strength. Expert in progressive overload and advanced training techniques.",
      availability: "All Week",
      trainingType: ["In-Person", "Hybrid"]
    },
    {
      id: "3",
      name: "Emma Chen",
      specialties: ["Yoga", "Flexibility", "Mindfulness", "Rehabilitation"],
      rating: 4.9,
      reviews: 156,
      experience: "6 years", 
      location: "Eastside",
      hourlyRate: 70,
      image: trainerEmma,
      certifications: ["RYT-500", "Corrective Exercise"],
      description: "Certified yoga instructor focusing on mind-body connection, flexibility, and injury prevention. Perfect for beginners and those seeking holistic wellness.",
      availability: "Flexible",
      trainingType: ["Online", "In-Person"]
    },
    {
      id: "4",
      name: "Alex Thompson", 
      specialties: ["CrossFit", "HIIT", "Endurance", "Functional Training"],
      rating: 4.7,
      reviews: 89,
      experience: "5 years",
      location: "Northside",
      hourlyRate: 80,
      image: trainerAlex,
      certifications: ["CrossFit L2", "ACSM-CPT"],
      description: "High-energy trainer specializing in functional movements and metabolic conditioning. Great for those who love challenging, varied workouts.",
      availability: "Evenings",
      trainingType: ["In-Person", "Group"]
    }
  ]);

  // Get enhanced matched trainers using client survey data
  const clientSurveyData = profile ? {
    primary_goals: (profile as any).primary_goals,
    secondary_goals: (profile as any).secondary_goals,
    training_location_preference: (profile as any).training_location_preference,
    open_to_virtual_coaching: (profile as any).open_to_virtual_coaching,
    preferred_training_frequency: (profile as any).preferred_training_frequency,
    preferred_time_slots: (profile as any).preferred_time_slots,
    start_timeline: (profile as any).start_timeline,
    preferred_coaching_style: (profile as any).preferred_coaching_style,
    motivation_factors: (profile as any).motivation_factors,
    client_personality_type: (profile as any).client_personality_type,
    experience_level: (profile as any).experience_level,
    preferred_package_type: (profile as any).preferred_package_type,
    budget_range_min: (profile as any).budget_range_min,
    budget_range_max: (profile as any).budget_range_max,
    budget_flexibility: (profile as any).budget_flexibility,
    waitlist_preference: (profile as any).waitlist_preference,
    flexible_scheduling: (profile as any).flexible_scheduling,
  } : undefined;

  const { matchedTrainers, hasMatches } = useEnhancedTrainerMatching(
    trainers, 
    profile?.quiz_answers as any,
    clientSurveyData
  );

  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>(trainers);


  const handleFiltersChange = (filters: any) => {
    // This would implement actual filtering logic
    console.log("Filters:", filters);
  };

  const handleViewProfile = (trainerId: string) => {
    console.log("View profile:", trainerId);
    // Track discovery stage progress
    updateProgress('discovery', 'browse_matches');
    // This would navigate to trainer detail page
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info and logout */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">PT Match Finder</h1>
        </div>
        <div className="flex items-center gap-3">
          {isClient() && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/saved')}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Saved ({savedTrainerIds.length})
            </Button>
          )}
          {profile && (
            <ProfileDropdown 
              profile={profile} 
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>

      {/* Progress Breadcrumb for Clients */}
      {isClient() && journeyProgress && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <ProgressBreadcrumb 
            progress={journeyProgress} 
            variant="compact"
            className="mb-6"
          />
        </div>
      )}

      {/* Role-specific content */}
      {isAdmin() && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Administrator Dashboard</strong> - You have full access to manage users, trainers, and platform settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {isTrainer() && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Trainer Dashboard</strong> - Manage your profile, view client requests, and update your availability.
              </p>
            </div>
          </div>
        </div>
      )}

      
      
      
      <SimpleHeroSection />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Discovery CTA for clients */}
        {isClient() && profile?.quiz_completed && (
          <div className="mb-8">
            <VisualSwipeSection />
          </div>
        )}
        
        {/* Show different content based on user role */}
        {!isTrainer() && <FilterSection onFiltersChange={handleFiltersChange} />}
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isAdmin() ? "All Personal Trainers" : 
                 isTrainer() ? "Your Trainer Profile" : 
                 profile?.quiz_completed ? "Personal Trainers" : "Featured Personal Trainers"}
              </h2>
              <p className="text-muted-foreground">
                {isAdmin() ? "Manage and verify trainer profiles" :
                 isTrainer() ? "View and edit your trainer profile" :
                 profile?.quiz_completed ? "All trainers sorted by compatibility - best matches first" :
                 "Discover certified trainers who can help you reach your fitness goals"}
              </p>
            </div>
            
            {/* Dashboard Button for Clients with Survey Completed */}
            {isClient() && profile?.quiz_completed && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/client/dashboard')}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                My Dashboard
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(profile?.quiz_completed ? matchedTrainers : filteredTrainers.map(t => ({ trainer: t, score: 0, matchReasons: [], matchDetails: [] }))).map((match) => (
            <TrainerCard
              key={match.trainer.id}
              trainer={match.trainer}
              onViewProfile={handleViewProfile}
              matchScore={match.score}
              matchReasons={match.matchReasons}
              matchDetails={match.matchDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
