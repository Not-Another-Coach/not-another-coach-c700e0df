import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTrainerMatching } from "@/hooks/useTrainerMatching";
import { SimpleHeroSection } from "@/components/SimpleHeroSection";

import { FilterSection } from "@/components/FilterSection";
import { VisualSwipeSection } from "@/components/VisualSwipeSection";
import { TrainerCard, Trainer } from "@/components/TrainerCard";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";
import trainerAlex from "@/assets/trainer-alex.jpg";

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { profile, loading: profileLoading, isAdmin, isTrainer, isClient } = useProfile();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
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

  // Get matched trainers based on quiz answers
  const { matchedTrainers, hasMatches } = useTrainerMatching(
    trainers, 
    profile?.quiz_answers as any
  );

  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>(trainers);


  const handleFiltersChange = (filters: any) => {
    // This would implement actual filtering logic
    console.log("Filters:", filters);
  };

  const handleViewProfile = (trainerId: string) => {
    console.log("View profile:", trainerId);
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
          {profile && (
            <ProfileDropdown 
              profile={profile} 
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>

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
          <h2 className="text-2xl font-bold mb-2">
            {isAdmin() ? "All Personal Trainers" : 
             isTrainer() ? "Your Trainer Profile" : 
             profile?.quiz_completed && hasMatches ? "Recommended for You" : "Featured Personal Trainers"}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin() ? "Manage and verify trainer profiles" :
             isTrainer() ? "View and edit your trainer profile" :
             profile?.quiz_completed && hasMatches ? "Based on your quiz answers, here are trainers that match your fitness goals" :
             "Discover certified trainers who can help you reach your fitness goals"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(profile?.quiz_completed ? matchedTrainers : filteredTrainers.map(t => ({ trainer: t, score: 0, matchReasons: [] }))).map((match) => (
            <TrainerCard
              key={match.trainer.id}
              trainer={match.trainer}
              onViewProfile={handleViewProfile}
              matchScore={match.score}
              matchReasons={match.matchReasons}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
