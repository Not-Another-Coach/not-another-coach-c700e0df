import { useNavigate } from "react-router-dom";
import { useEnhancedTrainerMatching } from "@/hooks/useEnhancedTrainerMatching";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useRealTrainers } from "@/hooks/useRealTrainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrainerCard } from "@/components/TrainerCard";
import { NewsAlertsSection } from "@/components/dashboard/NewsAlertsSection";
import { 
  Heart, 
  Settings, 
  Search, 
  MessageCircle, 
  Star, 
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Target
} from "lucide-react";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";
import trainerAlex from "@/assets/trainer-alex.jpg";

interface DashboardSummaryProps {
  profile: any;
  onTabChange: (tab: string) => void;
}

// Sample trainer data
const sampleTrainers = [
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
    description: "Passionate about helping clients achieve sustainable weight loss and building strength.",
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
    description: "Former competitive powerlifter dedicated to helping clients build serious muscle and strength.",
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
    description: "Certified yoga instructor focusing on mind-body connection, flexibility, and injury prevention.",
    availability: "Flexible",
    trainingType: ["Online", "In-Person"]
  }
];

export function DashboardSummary({ profile, onTabChange }: DashboardSummaryProps) {
  const navigate = useNavigate();
  const { savedTrainerIds } = useSavedTrainers();
  
  // Use real trainers from database
  const { trainers: realTrainers, loading: trainersLoading } = useRealTrainers();
  
  // Get enhanced matched trainers using client survey data
  const clientSurveyData = {
    primary_goals: profile.primary_goals,
    secondary_goals: profile.secondary_goals,
    training_location_preference: profile.training_location_preference,
    open_to_virtual_coaching: profile.open_to_virtual_coaching,
    preferred_training_frequency: profile.preferred_training_frequency,
    preferred_time_slots: profile.preferred_time_slots,
    start_timeline: profile.start_timeline,
    preferred_coaching_style: profile.preferred_coaching_style,
    motivation_factors: profile.motivation_factors,
    client_personality_type: profile.client_personality_type,
    experience_level: profile.experience_level,
    preferred_package_type: profile.preferred_package_type,
    budget_range_min: profile.budget_range_min,
    budget_range_max: profile.budget_range_max,
    budget_flexibility: profile.budget_flexibility,
    waitlist_preference: profile.waitlist_preference,
    flexible_scheduling: profile.flexible_scheduling,
  };

  // Combine real trainers with sample trainers for better matching experience
  const allTrainers = [...realTrainers, ...sampleTrainers];

  const { matchedTrainers, topMatches } = useEnhancedTrainerMatching(
    allTrainers, 
    profile.quiz_answers,
    clientSurveyData
  );

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    const fields = [
      profile.primary_goals?.length > 0,
      profile.training_location_preference,
      profile.preferred_training_frequency,
      profile.preferred_time_slots?.length > 0,
      profile.preferred_coaching_style?.length > 0,
      profile.client_personality_type?.length > 0,
      profile.preferred_package_type,
      profile.budget_range_min || profile.budget_range_max
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = getProfileCompletion();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile.first_name || 'there'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Your fitness journey continues. Here's what's happening with your matches and progress.
        </p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{topMatches.length}</div>
            <p className="text-sm text-muted-foreground">Top Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{savedTrainerIds.length}</div>
            <p className="text-sm text-muted-foreground">Saved Trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">Active Chats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">Discovery Calls</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Section - Only show if not 100% complete */}
      {profileCompletion < 100 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Complete Your Survey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Survey Completion</p>
                <p className="text-sm text-muted-foreground">
                  {profileCompletion}% complete - Complete the full survey for better matches
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{profileCompletion}%</div>
              </div>
            </div>
            <Progress value={profileCompletion} className="w-full" />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/client-survey')}
              >
                Complete Survey
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Your Top Matches */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Your Top Matches
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onTabChange('explore')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topMatches.length > 0 ? (
                <div className="space-y-4">
                  {topMatches.slice(0, 2).map((match) => (
                    <div key={match.trainer.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={match.trainer.image} 
                          alt={match.trainer.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{match.trainer.name}</h3>
                            <Badge variant="secondary">
                              {match.score}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {match.trainer.specialties.slice(0, 2).join(' • ')}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/trainer/${match.trainer.id}`)}
                            >
                              View Profile
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                // Open messaging popup instead of navigating
                                const messagingButton = document.querySelector('[data-messaging-button]') as HTMLButtonElement;
                                if (messagingButton) {
                                  messagingButton.click();
                                }
                              }}
                            >
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Complete your preferences to see personalized matches
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => onTabChange('preferences')}
                  >
                    Update Preferences
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* News & Alerts Section */}
          <NewsAlertsSection />
          
          {/* Messages Waiting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm">
                  No messages yet. Start connecting with trainers to begin conversations!
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => onTabChange('messages')}
                >
                  View Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
