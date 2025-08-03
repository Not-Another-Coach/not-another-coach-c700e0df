import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnhancedTrainerMatching } from "@/hooks/useEnhancedTrainerMatching";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrainerCard } from "@/components/TrainerCard";
import { SwipeableCard } from "@/components/SwipeableCard";
import { 
  Search, 
  Filter, 
  Heart, 
  Users, 
  Star, 
  Grid3X3,
  List,
  Shuffle,
  Target,
  Clock,
  MapPin
} from "lucide-react";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";
import trainerAlex from "@/assets/trainer-alex.jpg";

interface ExploreMatchSectionProps {
  profile: any;
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
    description: "High-energy trainer specializing in functional movements and metabolic conditioning.",
    availability: "Evenings",
    trainingType: ["In-Person", "Group"]
  }
];

export function ExploreMatchSection({ profile }: ExploreMatchSectionProps) {
  const navigate = useNavigate();
  const { savedTrainerIds } = useSavedTrainers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [activeTab, setActiveTab] = useState("recommended");

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

  const { matchedTrainers, topMatches, goodMatches } = useEnhancedTrainerMatching(
    sampleTrainers, 
    profile.quiz_answers,
    clientSurveyData
  );

  // Get saved trainers
  const savedTrainers = matchedTrainers.filter(match => 
    savedTrainerIds.includes(match.trainer.id)
  );

  // Mock matched trainers (those with mutual interest)
  const mutualMatches = matchedTrainers.filter(match => match.score >= 80);

  // Filter trainers based on search and filters
  const filterTrainers = (trainers: any[]) => {
    return trainers.filter(match => {
      const trainer = match.trainer;
      const matchesSearch = !searchTerm || 
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialties.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGoal = selectedGoal === "all" || 
        trainer.specialties.some((spec: string) => spec.toLowerCase().includes(selectedGoal.toLowerCase()));
      
      const matchesLocation = selectedLocation === "all" || 
        trainer.location.toLowerCase().includes(selectedLocation.toLowerCase());
      
      return matchesSearch && matchesGoal && matchesLocation;
    });
  };

  const handleSwipe = (direction: 'left' | 'right', trainer: any) => {
    console.log(`Swiped ${direction} on trainer ${trainer.id}`);
    // Here you would implement the swipe logic
  };

  const handleViewProfile = (trainerId: string) => {
    console.log("View profile:", trainerId);
    // This would navigate to trainer detail page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Explore & Match</h1>
          <p className="text-muted-foreground">
            Discover trainers, manage your matches, and connect with coaches
          </p>
        </div>
        <Button onClick={() => navigate('/discovery')}>
          <Shuffle className="h-4 w-4 mr-2" />
          Swipe Mode
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search trainers by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="weight loss">Weight Loss</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="crossfit">CrossFit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="downtown">Downtown</SelectItem>
                  <SelectItem value="westside">Westside</SelectItem>
                  <SelectItem value="eastside">Eastside</SelectItem>
                  <SelectItem value="northside">Northside</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Recommended</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List View</span>
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Liked</span>
          </TabsTrigger>
          <TabsTrigger value="matched" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Matched</span>
          </TabsTrigger>
          <TabsTrigger value="swipe" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Swipe</span>
          </TabsTrigger>
        </TabsList>

        {/* Recommended For You */}
        <TabsContent value="recommended" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterTrainers(topMatches).map((match) => (
                <div key={match.trainer.id} className="relative">
                  <TrainerCard
                    trainer={match.trainer}
                    onViewProfile={handleViewProfile}
                    matchScore={match.score}
                    matchReasons={match.matchReasons}
                    matchDetails={match.matchDetails}
                  />
                  <Badge 
                    className="absolute top-2 right-2 bg-primary text-primary-foreground"
                  >
                    ⚡{match.score}% Match
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {goodMatches.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Good Matches</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTrainers(goodMatches).slice(0, 6).map((match) => (
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
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Trainers</h2>
            <Badge variant="outline">{filterTrainers(matchedTrainers).length} trainers</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterTrainers(matchedTrainers).map((match) => (
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
        </TabsContent>

        {/* Liked Profiles */}
        <TabsContent value="liked" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Liked Trainers</h2>
            <Badge variant="outline">{savedTrainers.length} saved</Badge>
          </div>
          {savedTrainers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrainers.map((match) => (
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
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved trainers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Like trainers to save them for later and build your shortlist
                </p>
                <Button onClick={() => setActiveTab('recommended')}>
                  Explore Trainers
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Matched Coaches */}
        <TabsContent value="matched" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Mutual Matches</h2>
            <Badge variant="outline">{mutualMatches.length} matches</Badge>
          </div>
          {mutualMatches.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                These trainers are interested in working with you! You can now book discovery calls or send messages.
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mutualMatches.map((match) => (
                  <div key={match.trainer.id} className="relative">
                    <TrainerCard
                      trainer={match.trainer}
                      onViewProfile={handleViewProfile}
                      matchScore={match.score}
                      matchReasons={match.matchReasons}
                      matchDetails={match.matchDetails}
                    />
                    <Badge 
                      className="absolute top-2 right-2 bg-green-500 text-white"
                    >
                      Mutual Match!
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No mutual matches yet</h3>
                <p className="text-muted-foreground mb-4">
                  Keep swiping and liking trainers to increase your chances of mutual matches
                </p>
                <Button onClick={() => navigate('/discovery')}>
                  Start Swiping
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Swipe Cards */}
        <TabsContent value="swipe" className="space-y-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Quick Swipe Mode</h2>
            <p className="text-muted-foreground">
              Swipe right to like, left to pass. Find your perfect match!
            </p>
          </div>
          
          {matchedTrainers.length > 0 ? (
            <div className="max-w-md mx-auto">
              <SwipeableCard
                trainer={matchedTrainers[0].trainer}
                onSwipe={handleSwipe}
                matchScore={matchedTrainers[0].score}
                matchReasons={matchedTrainers[0].matchReasons}
                index={0}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shuffle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No more trainers to swipe</h3>
                <p className="text-muted-foreground mb-4">
                  You've seen all available trainers. Check back later for new matches!
                </p>
                <Button onClick={() => setActiveTab('recommended')}>
                  View Recommended
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}