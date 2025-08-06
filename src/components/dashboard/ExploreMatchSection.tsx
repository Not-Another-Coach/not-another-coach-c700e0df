import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEnhancedTrainerMatching } from "@/hooks/useEnhancedTrainerMatching";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useTrainerEngagement } from "@/hooks/useTrainerEngagement";
import { useConversations } from "@/hooks/useConversations";
import { useRealTrainers } from "@/hooks/useRealTrainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwipeResultsSection } from "@/components/dashboard/SwipeResultsSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TrainerCard } from "@/components/TrainerCard";
import { SwipeableCard } from "@/components/SwipeableCard";
import { ComparisonView } from "@/components/ComparisonView";
import { BookDiscoveryCallButton } from "@/components/discovery-call/BookDiscoveryCallButton";
import { EditDiscoveryCallButton } from "@/components/discovery-call/EditDiscoveryCallButton";
import { ClientRescheduleModal } from "./ClientRescheduleModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Heart, 
  Users, 
  Star, 
  Grid3X3,
  List,
  Target,
  Shuffle,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  X,
  BarChart3
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
    id: "550e8400-e29b-41d4-a716-446655440001",
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
    id: "550e8400-e29b-41d4-a716-446655440002",
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
    id: "550e8400-e29b-41d4-a716-446655440003",
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
    id: "4f90441a-20de-4f62-99aa-2440b12228dd",
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
  const { savedTrainerIds, unsaveTrainer } = useSavedTrainers();
  const { shortlistTrainer, isShortlisted, shortlistCount, canShortlistMore, removeFromShortlist, bookDiscoveryCall, shortlistedTrainers: actualShortlistedTrainers } = useShortlistedTrainers();
  
  // Import engagement functions for updating trainer status
  const { proceedWithCoach, rejectCoach } = useTrainerEngagement();
  
  // Import conversation functionality
  const { createConversation, conversations } = useConversations();
  
  // Use real trainers from database
  const { trainers: realTrainers, loading: trainersLoading } = useRealTrainers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [browseView, setBrowseView] = useState("recommended"); // Sub-navigation for browse tab
  
  // Comparison functionality
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonContext, setComparisonContext] = useState<'saved' | 'shortlisted' | 'general'>('general');

  // Reschedule modal state
  const [selectedDiscoveryCall, setSelectedDiscoveryCall] = useState<any>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

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

  const { matchedTrainers, topMatches, goodMatches } = useEnhancedTrainerMatching(
    allTrainers, 
    profile.quiz_answers,
    clientSurveyData
  );

  // Pre-calculate match data for ALL trainers to avoid hook violations
  const allTrainerMatches = useMemo(() => {
    // Create a map of all trainer matches for quick lookup
    const matchMap = new Map();
    matchedTrainers.forEach(match => {
      matchMap.set(match.trainer.id, match);
    });
    return matchMap;
  }, [matchedTrainers]);

  // Filter matched trainers to exclude saved ones from Browse tab
  const browseTrainers = matchedTrainers.filter(match => 
    !savedTrainerIds.includes(match.trainer.id)
  );

  // Get saved trainers - simple approach using memoization
  const savedTrainers = useMemo(() => {
    // First try to get from matched trainers
    const savedFromMatched = matchedTrainers.filter(match => 
      savedTrainerIds.includes(match.trainer.id) && !isShortlisted(match.trainer.id)
    );

    // For any saved trainers not in matched results, create simple placeholders
    const savedIdsFromMatched = savedFromMatched.map(s => s.trainer.id);
    const missingSavedIds = savedTrainerIds.filter(id => 
      !savedIdsFromMatched.includes(id) && !isShortlisted(id)
    );

    const missingTrainerPlaceholders = missingSavedIds.map(trainerId => ({
      trainer: {
        id: trainerId,
        name: "Private Trainer",
        specialties: ["Personal Training"],
        rating: 4.5,
        reviews: 8,
        experience: "3+ years",
        location: "Location TBD",
        hourlyRate: 75,
        image: "/placeholder.svg",
        certifications: ["Certified Personal Trainer"],
        description: "Professional personal trainer ready to help you achieve your fitness goals.",
        availability: "Flexible",
        trainingType: ["1-on-1", "Virtual"],
        offers_discovery_call: true
      },
      score: 85,
      matchReasons: ["Previously saved trainer"],
      matchDetails: []
    }));

    const allSavedTrainers = [...savedFromMatched, ...missingTrainerPlaceholders];
    
    // Deduplicate by trainer ID to prevent duplicate keys and checkbox conflicts
    const uniqueTrainers = allSavedTrainers.reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => item.trainer.id === current.trainer.id);
      if (existingIndex === -1) {
        acc.push(current);
      } else {
        console.warn(`Duplicate trainer found: ${current.trainer.id} - ${current.trainer.name}. Keeping the better match.`);
        // Keep the one with higher score or more data
        if (current.score > acc[existingIndex].score || current.matchDetails.length > 0) {
          acc[existingIndex] = current;
        }
      }
      return acc;
    }, [] as typeof allSavedTrainers);

    console.log('Deduplicated saved trainers:', uniqueTrainers.map(t => ({ id: t.trainer.id, name: t.trainer.name })));
    
    return uniqueTrainers;
  }, [matchedTrainers, savedTrainerIds, isShortlisted]);

  // Get shortlisted trainers
  const shortlistedTrainers = matchedTrainers.filter(match => 
    isShortlisted(match.trainer.id)
  );

  // Helper function to get match data for any trainer (no hooks!)
  const getTrainerMatchData = (trainer: any) => {
    // Check if trainer is already in our matches
    const existingMatch = allTrainerMatches.get(trainer.id);
    if (existingMatch) {
      return existingMatch;
    }

    // For trainers not in the matches, return basic match data
    return {
      trainer,
      score: 75, // Give a reasonable default score
      matchReasons: ["Manually added trainer"],
      matchDetails: [
        {
          category: "Goals",
          score: 80,
          icon: Target,
          color: "text-green-500"
        },
        {
          category: "Location",
          score: 70,
          icon: MapPin,
          color: "text-blue-500"
        },
        {
          category: "Experience",
          score: 75,
          icon: Users,
          color: "text-purple-500"
        }
      ],
      compatibilityPercentage: 75
    };
  };

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
    navigate(`/trainer/${trainerId}`);
  };

  const handleMessage = (trainerId: string) => {
    // Dispatch a custom event to open messaging popup with specific trainer
    const event = new CustomEvent('openMessagePopup', {
      detail: { trainerId }
    });
    window.dispatchEvent(event);
  };

  const handleCreateConversation = async (trainerId: string) => {
    // Create conversation and navigate to messaging
    const result = await createConversation(trainerId);
    if (!result.error) {
      navigate('/messaging');
    }
  };

  const handleShortlist = async (trainerId: string) => {
    if (!canShortlistMore) {
      toast.error('You can only shortlist up to 4 trainers');
      return;
    }
    
    const result = await shortlistTrainer(trainerId);
    if (result.error) {
      toast.error('Failed to shortlist trainer');
    } else {
      toast.success('Trainer added to shortlist!');
      // Force a small delay to ensure state updates
      setTimeout(() => {
        // The tabs should automatically update due to the reactive state
        console.log('Shortlist action completed for trainer:', trainerId);
      }, 500);
    }
  };

  const handleRemoveFromShortlist = async (trainerId: string, trainerName: string) => {
    // Show confirmation dialog asking if they want to keep the trainer saved
    const keepSaved = await new Promise<boolean>((resolve) => {
      const dialog = document.createElement('div');
      dialog.innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 class="text-lg font-semibold mb-2">Remove from Shortlist</h3>
            <p class="text-gray-600 mb-4">
              Do you want to keep ${trainerName} in your saved trainers for future reference?
            </p>
            <div class="flex gap-2 justify-end">
              <button id="remove-all" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Remove from Both
              </button>
              <button id="keep-saved" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Keep Saved
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);

      const handleKeepSaved = () => {
        document.body.removeChild(dialog);
        resolve(true);
      };

      const handleRemoveAll = () => {
        document.body.removeChild(dialog);
        resolve(false);
      };

      dialog.querySelector('#keep-saved')?.addEventListener('click', handleKeepSaved);
      dialog.querySelector('#remove-all')?.addEventListener('click', handleRemoveAll);
    });

    // Remove from shortlist
    console.log('Removing trainer from shortlist:', trainerId);
    const result = await removeFromShortlist(trainerId);
    if (result.error) {
      console.error('Error removing from shortlist:', result.error);
      toast.error('Failed to remove from shortlist');
      return;
    }

    // If user chose to remove from saved as well
    if (!keepSaved) {
      await unsaveTrainer(trainerId);
      toast.success(`${trainerName} removed from shortlist and saved trainers`);
    } else {
      toast.success(`${trainerName} removed from shortlist but kept in saved trainers`);
    }
    
    // Force a refresh after a short delay to ensure the UI updates
    setTimeout(() => {
      console.log('Shortlist removal completed for trainer:', trainerId);
    }, 500);
  };

  // Comparison functionality for saved trainers
  const [savedComparison, setSavedComparison] = useState<string[]>([]);
  const [shortlistedComparison, setShortlistedComparison] = useState<string[]>([]);

  const handleSavedComparisonToggle = (trainerId: string) => {
    console.log('handleSavedComparisonToggle called for trainer:', trainerId);
    console.log('Current savedComparison state:', savedComparison);
    
    setSavedComparison(prev => {
      const newState = prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : prev.length < 4 
          ? [...prev, trainerId] 
          : prev;
      
      console.log('New savedComparison state:', newState);
      return newState;
    });
  };

  // Clean up comparison state when savedTrainers changes to remove invalid trainer IDs
  useEffect(() => {
    const savedTrainerIds = savedTrainers.map(match => match.trainer.id);
    setSavedComparison(prev => prev.filter(id => savedTrainerIds.includes(id)));
  }, [savedTrainers]);

  // Clean up shortlisted comparison state when shortlisted trainers change
  useEffect(() => {
    const shortlistedTrainerIds = actualShortlistedTrainers.map(shortlisted => shortlisted.trainer_id);
    setShortlistedComparison(prev => prev.filter(id => shortlistedTrainerIds.includes(id)));
  }, [actualShortlistedTrainers]);

  const handleShortlistedComparisonToggle = (trainerId: string) => {
    setShortlistedComparison(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : prev.length < 4 
          ? [...prev, trainerId] 
          : prev
    );
  };

  const getSavedSelectedTrainersData = () => {
    // Filter from deduplicated saved trainers instead of allTrainers
    const savedTrainerData = savedTrainers.map(match => match.trainer);
    return savedTrainerData.filter(trainer => savedComparison.includes(trainer.id));
  };

  const getShortlistedSelectedTrainersData = () => {
    // Build trainer data from shortlisted trainers directly, handling missing trainers in allTrainers
    const shortlistedTrainerData = actualShortlistedTrainers
      .filter(shortlisted => shortlistedComparison.includes(shortlisted.trainer_id))
      .map(shortlisted => {
        // Find the trainer data from all trainers (sample + real)
        let trainer = allTrainers.find(t => t.id === shortlisted.trainer_id);
        
        // If not found in allTrainers, create a fallback trainer object
        if (!trainer) {
          console.warn(`Creating fallback trainer data for ${shortlisted.trainer_id}`);
          trainer = {
            id: shortlisted.trainer_id,
            name: `Trainer ${shortlisted.trainer_id.slice(0, 8)}...`,
            specialties: ["General Fitness"],
            rating: 4.5,
            reviews: 0,
            experience: 'Not specified',
            location: 'Location not specified',
            hourlyRate: 75,
            image: '/placeholder.svg',
            certifications: ['Certified Personal Trainer'],
            description: 'Experienced personal trainer focused on helping you achieve your fitness goals.',
            availability: 'Flexible',
            trainingType: ['In-Person', 'Online']
          };
        }
        
        return trainer;
      });
    
    return shortlistedTrainerData;
  };

  const handleStartSavedComparison = () => {
    const selectedTrainersData = getSavedSelectedTrainersData();
    if (selectedTrainersData.length >= 2) {
      setSelectedForComparison(savedComparison);
      setComparisonContext('saved');
      setShowComparison(true);
    }
  };

  const handleStartShortlistedComparison = () => {
    const selectedTrainersData = getShortlistedSelectedTrainersData();
    console.log('Starting shortlisted comparison with trainers:', selectedTrainersData.map(t => ({ id: t.id, name: t.name })));
    if (selectedTrainersData.length >= 2) {
      setSelectedForComparison(shortlistedComparison);
      setComparisonContext('shortlisted');
      setShowComparison(true);
    } else {
      toast.error('Please select at least 2 trainers to compare');
    }
  };

  const getSelectedTrainersData = () => {
    // Use the appropriate data source based on comparison context
    switch (comparisonContext) {
      case 'saved':
        return getSavedSelectedTrainersData();
      case 'shortlisted':
        return getShortlistedSelectedTrainersData();
      default:
        return allTrainers.filter(trainer => selectedForComparison.includes(trainer.id));
    }
  };

  const handleStartComparison = () => {
    if (selectedForComparison.length < 2) {
      toast.error('Please select at least 2 trainers to compare');
      return;
    }
    setShowComparison(true);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
    setSelectedForComparison([]);
    setComparisonContext('general');
  };

  // Show comparison view if active
  if (showComparison) {
    return (
      <ComparisonView 
        trainers={getSelectedTrainersData()} 
        onClose={handleCloseComparison}
      />
    );
  }

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Browse</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {savedTrainers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="shortlisted" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Shortlisted</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {actualShortlistedTrainers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Discover</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {actualShortlistedTrainers.filter(st => st.discovery_call).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab - Combines Recommended, Match, and List View */}
        <TabsContent value="browse" className="space-y-6">
          {/* Sub-navigation for Browse views */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={browseView === "recommended" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBrowseView("recommended")}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Recommended
              </Button>
              <Button
                variant={browseView === "matches" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBrowseView("matches")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Matches
              </Button>
              <Button
                variant={browseView === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBrowseView("all")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                All Trainers
              </Button>
            </div>
          </div>

          {/* Recommended View */}
          {browseView === "recommended" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterTrainers(browseTrainers.filter(match => topMatches.includes(match))).map((match) => (
                    <div key={match.trainer.id} className="relative">
                      <TrainerCard
                        trainer={match.trainer}
                        onViewProfile={handleViewProfile}
                        matchScore={match.score}
                        matchReasons={match.matchReasons}
                        matchDetails={match.matchDetails}
                      />
                      <Badge 
                        className="absolute top-2 right-1/2 transform translate-x-1/2 bg-primary text-primary-foreground z-10"
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
                    {filterTrainers(browseTrainers.filter(match => goodMatches.includes(match))).slice(0, 6).map((match) => (
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
            </div>
          )}

          {/* Matches View */}
          {browseView === "matches" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Mutual Matches</h2>
                <Badge variant="outline">{mutualMatches.length} matches</Badge>
              </div>
              {mutualMatches.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    These trainers are interested in working with you! You can save them to your shortlist.
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mutualMatches.map((match) => (
                      <TrainerCard
                        key={`mutual-${match.trainer.id}`} // More unique key
                        trainer={match.trainer}
                        onViewProfile={handleViewProfile}
                        matchScore={match.score}
                        matchReasons={match.matchReasons}
                        matchDetails={match.matchDetails}
                        cardState="matched"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No mutual matches yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Keep exploring trainers! Mutual matches appear when trainers are also interested in working with you.
                    </p>
                    <Button onClick={() => setBrowseView('recommended')}>
                      View Recommended Trainers
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* All Trainers View */}
          {browseView === "all" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Trainers</h2>
                <Badge variant="outline">{filterTrainers(browseTrainers).length} trainers</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTrainers(browseTrainers).map((match) => (
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

        {/* Saved Trainers */}
        <TabsContent value="saved" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-xl font-semibold">Your Saved Trainers</h2>
            {savedComparison.length >= 2 && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleStartSavedComparison}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Compare ({savedComparison.length})
              </Button>
            )}
          </div>
          {savedTrainers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrainers.map((match, index) => {
                console.log(`Rendering saved trainer ${index}:`, match.trainer.id, match.trainer.name);
                return (
                  <div key={`saved-${match.trainer.id}-${index}`} className="space-y-3">
                    <TrainerCard
                      trainer={match.trainer}
                      onViewProfile={handleViewProfile}
                      matchScore={match.score}
                      matchReasons={match.matchReasons}
                      matchDetails={match.matchDetails}
                      cardState={isShortlisted(match.trainer.id) ? "shortlisted" : "saved"}
                      showComparisonCheckbox={true}
                      comparisonChecked={savedComparison.includes(match.trainer.id)}
                      onComparisonToggle={handleSavedComparisonToggle}
                      comparisonDisabled={!savedComparison.includes(match.trainer.id) && savedComparison.length >= 4}
                    />
                    
                    {/* External CTAs for Saved Trainers */}
                    <div className="space-y-2">
                      {/* Show Add to Shortlist if not already shortlisted */}
                      {!isShortlisted(match.trainer.id) && (
                        <Button
                          onClick={() => shortlistTrainer(match.trainer.id)}
                          className="w-full"
                          size="sm"
                          disabled={!canShortlistMore}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {canShortlistMore ? 'Add to Shortlist' : `Shortlist Full (${shortlistCount}/4)`}
                        </Button>
                      )}
                      
                      {/* Show shortlisted actions if already shortlisted */}
                      {isShortlisted(match.trainer.id) && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-800 rounded-lg border border-green-200">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-medium">Shortlisted</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs"
                              onClick={() => handleCreateConversation(match.trainer.id)}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Chat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="text-xs"
                              onClick={() => handleCreateConversation(match.trainer.id)}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Discovery Call
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved trainers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Like trainers by clicking the heart icon to save them for later and build your shortlist
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Explore Trainers
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Shortlisted Trainers */}
        <TabsContent value="shortlisted" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-xl font-semibold">Your Shortlisted Trainers</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{shortlistCount}/4 shortlisted</Badge>
              {shortlistedComparison.length >= 2 && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleStartShortlistedComparison}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Compare ({shortlistedComparison.length})
                </Button>
              )}
            </div>
          </div>
          {actualShortlistedTrainers.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                These are your top trainer choices. You can chat with them and book discovery calls.
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actualShortlistedTrainers.map((shortlisted) => {
                  // Find the trainer data from all trainers (sample + real)
                  let trainer = allTrainers.find(t => t.id === shortlisted.trainer_id);
                  
                  // If not found in allTrainers, try to fetch from database or use enhanced fallback
                  if (!trainer) {
                    console.warn(`Trainer ${shortlisted.trainer_id} not found in allTrainers. This may indicate a data inconsistency.`);
                    
                    // Create enhanced trainer object with better defaults
                    trainer = {
                      id: shortlisted.trainer_id,
                      name: `Trainer ${shortlisted.trainer_id.slice(0, 8)}...`,
                      specialties: ["General Fitness"],
                      rating: 4.5,
                      reviews: 0,
                      experience: 'Not specified',
                      location: 'Location not specified',
                      hourlyRate: 0,
                      image: '/placeholder.svg',
                      certifications: [],
                      description: 'Profile details not available.',
                      availability: 'Contact for availability',
                      trainingType: ["Contact for details"],
                      offers_discovery_call: false // Default to false for unknown trainers
                    } as any;
                  }

                  // Calculate match data for this trainer to ensure consistency
                  const matchData = getTrainerMatchData(trainer);
                  
                   return (
                    <div key={`shortlisted-${shortlisted.trainer_id}-${shortlisted.stage}`} className="space-y-3">
                      <TrainerCard
                        trainer={matchData.trainer}
                        onViewProfile={handleViewProfile}
                        matchScore={matchData.score}
                        matchReasons={matchData.matchReasons}
                        matchDetails={matchData.matchDetails}
                        cardState="shortlisted"
                        showComparisonCheckbox={true}
                        comparisonChecked={shortlistedComparison.includes(shortlisted.trainer_id)}
                        onComparisonToggle={handleShortlistedComparisonToggle}
                        comparisonDisabled={!shortlistedComparison.includes(shortlisted.trainer_id) && shortlistedComparison.length >= 4}
                        showRemoveButton={true}
                        onRemove={(trainerId) => handleRemoveFromShortlist(trainerId, matchData.trainer.name)}
                        hasDiscoveryCall={!!shortlisted.discovery_call}
                        discoveryCallData={shortlisted.discovery_call}
                        trainerOffersDiscoveryCalls={(trainer as any).offers_discovery_call || false}
                      />
                      
                      {/* External CTAs for Shortlisted Trainers */}
                      <div className="space-y-2 border-4 border-blue-500 bg-blue-100 p-4 rounded-lg">
                        <div className="text-lg text-blue-900 font-bold">🔵 DEBUG: SHORTLIST CTAs HERE 🔵</div>
                        <div className="text-sm text-blue-700">Trainer ID: {shortlisted.trainer_id}</div>
                        <div className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-800 rounded-lg border border-green-200">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">Shortlisted</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => handleCreateConversation(shortlisted.trainer_id)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="text-xs"
                            onClick={async () => {
                              console.log('Discovery call clicked for trainer:', shortlisted.trainer_id);
                              await bookDiscoveryCall(shortlisted.trainer_id);
                              // Also create conversation for messaging
                              await handleCreateConversation(shortlisted.trainer_id);
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Discovery Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shortlisted trainers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add up to 4 trainers to your shortlist from your saved trainers to unlock chat and discovery call features.
                </p>
                <Button onClick={() => setActiveTab('saved')}>
                  View Saved Trainers
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Discover Tab - Discovery functionality using TrainerCard layout */}
        <TabsContent value="discover" className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-xl font-semibold">Discovery Opportunities</h2>
              <Badge variant="outline">{actualShortlistedTrainers.filter(st => st.discovery_call).length} available</Badge>
            </div>
            
            {actualShortlistedTrainers.filter(st => st.discovery_call).length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Chat with your shortlisted trainers and book discovery calls to learn more about their approach.
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {actualShortlistedTrainers.filter(st => st.discovery_call).map((shortlisted) => {
                    // Find the trainer data from all trainers (sample + real)
                    let trainer = allTrainers.find(t => t.id === shortlisted.trainer_id);
                    
                    // If not found in allTrainers, create basic trainer object
                    if (!trainer) {
                      trainer = {
                        id: shortlisted.trainer_id,
                        name: `Trainer ${shortlisted.trainer_id}`,
                        specialties: [],
                        rating: 0,
                        reviews: 0,
                        experience: '',
                        location: '',
                        hourlyRate: 0,
                        image: '',
                        certifications: [],
                        description: '',
                        availability: '',
                        trainingType: [],
                        offers_discovery_call: true
                      } as any; // Type assertion to avoid TypeScript issues
                    }

                    // Calculate match data for this trainer to ensure consistency
                    const matchData = getTrainerMatchData(trainer);
                    
                    return (
                      <TrainerCard
                        key={shortlisted.trainer_id}
                        trainer={matchData.trainer}
                        onViewProfile={handleViewProfile}
                        matchScore={matchData.score}
                        matchReasons={matchData.matchReasons}
                        matchDetails={matchData.matchDetails}
                        cardState="discovery"
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discovery opportunities</h3>
                  <p className="text-muted-foreground mb-4">
                    Add trainers to your shortlist to unlock discovery call features
                  </p>
                  <Button onClick={() => setActiveTab('shortlisted')}>
                    View Shortlisted Trainers
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

      </Tabs>

      {/* Client Reschedule Modal */}
      {selectedDiscoveryCall && (
        <ClientRescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setSelectedDiscoveryCall(null);
          }}
          discoveryCall={selectedDiscoveryCall}
          trainer={selectedDiscoveryCall.trainer}
          onCallUpdated={() => {
            // Refresh the shortlisted trainers data
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}
    </div>
  );
}