import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEnhancedTrainerMatching } from "@/hooks/useEnhancedTrainerMatching";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useRealTrainers } from "@/hooks/useRealTrainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedTrainerCard } from "@/components/trainer-cards/EnhancedTrainerCard";
import { ComparisonView } from "@/components/ComparisonView";
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

interface ExploreMatchSectionProps {
  profile: any;
}

export function ExploreMatchSection({ profile }: ExploreMatchSectionProps) {
  const navigate = useNavigate();
  const { saveTrainer, isTrainerSaved } = useSavedTrainers();
  const { shortlistTrainer, isShortlisted, shortlistCount, canShortlistMore } = useShortlistedTrainers();
  
  // Use real trainers from database
  const { trainers: realTrainers, loading: trainersLoading } = useRealTrainers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Comparison functionality
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

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
    realTrainers, 
    profile.quiz_answers,
    clientSurveyData
  );

  // Filter matched trainers based on search and filters
  const filteredTrainers = useMemo(() => {
    return matchedTrainers.filter(match => {
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
  }, [matchedTrainers, searchTerm, selectedGoal, selectedLocation]);

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

  const handleSaveTrainer = async (trainerId: string) => {
    console.log('🔥 Save trainer clicked:', trainerId);
    try {
      const result = await saveTrainer(trainerId);
      if (result) {
        toast.success('Trainer saved!');
      } else {
        toast.error('Failed to save trainer');
      }
    } catch (error) {
      console.error('Error saving trainer:', error);
      toast.error('Failed to save trainer');
    }
  };

  const handleShortlist = async (trainerId: string) => {
    console.log('🔥 Shortlist trainer clicked:', trainerId);
    if (!canShortlistMore) {
      toast.error('You can only shortlist up to 4 trainers');
      return;
    }
    
    try {
      const result = await shortlistTrainer(trainerId);
      if (result.error) {
        toast.error('Failed to shortlist trainer');
      } else {
        toast.success('Trainer added to shortlist!');
      }
    } catch (error) {
      console.error('Error shortlisting trainer:', error);
      toast.error('Failed to shortlist trainer');
    }
  };

  const handleComparisonToggle = (trainerId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : prev.length < 4 
          ? [...prev, trainerId] 
          : prev
    );
  };

  const handleStartComparison = () => {
    if (selectedForComparison.length >= 2) {
      setShowComparison(true);
    }
  };

  const getSelectedTrainersData = () => {
    return filteredTrainers
      .filter(match => selectedForComparison.includes(match.trainer.id))
      .map(match => match.trainer);
  };

  const renderCTAs = (trainer: any) => {
    const isSaved = isTrainerSaved(trainer.id);
    const isShortlistedTrainer = isShortlisted(trainer.id);

    return (
      <div className="space-y-2 p-3 bg-background border rounded-lg">
        <div className="grid grid-cols-2 gap-2">
          {!isSaved && !isShortlistedTrainer && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSaveTrainer(trainer.id)}
            >
              <Heart className="h-3 w-3 mr-1" />
              Save
            </Button>
          )}
          
          {isSaved && !isShortlistedTrainer && (
            <Button 
              size="sm" 
              variant="default"
              onClick={() => handleShortlist(trainer.id)}
              disabled={!canShortlistMore}
            >
              <Star className="h-3 w-3 mr-1" />
              {canShortlistMore ? 'Shortlist' : 'Full'}
            </Button>
          )}
          
          {isShortlistedTrainer && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/my-trainers')}
            >
              <Star className="h-3 w-3 mr-1 fill-current" />
              Shortlisted
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleMessage(trainer.id)}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Message
          </Button>
        </div>
      </div>
    );
  };

  if (showComparison) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowComparison(false)}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Back to Explore
          </Button>
          <h2 className="text-xl font-semibold">Compare Trainers</h2>
        </div>
        <ComparisonView
          trainers={getSelectedTrainersData()}
          onClose={() => setShowComparison(false)}
        />
      </div>
    );
  }

  if (trainersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Explore Trainers
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredTrainers.length} trainers
              </Badge>
              {selectedForComparison.length >= 2 && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleStartComparison}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Compare ({selectedForComparison.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search trainers by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Fitness Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="weight loss">Weight Loss</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="muscle">Muscle Building</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="uptown">Uptown</SelectItem>
                <SelectItem value="suburbs">Suburbs</SelectItem>
                <SelectItem value="online">Online Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="weekend">Weekends</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {filteredTrainers.length} trainers matching your criteria
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/my-trainers')}>
            <Users className="h-4 w-4 mr-2" />
            My Trainers ({shortlistCount})
          </Button>
        </div>
      </div>

      {/* Trainers Grid/List */}
      {filteredTrainers.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredTrainers.map((match) => (
            <div key={match.trainer.id} className="space-y-3">
              <EnhancedTrainerCard
                trainer={match.trainer}
                onViewProfile={handleViewProfile}
                matchScore={match.score}
                matchReasons={match.matchReasons}
                cardState={
                  isShortlisted(match.trainer.id) ? "shortlisted" : 
                  isTrainerSaved(match.trainer.id) ? "saved" : 
                  "default"
                }
                showComparisonCheckbox={true}
                comparisonChecked={selectedForComparison.includes(match.trainer.id)}
                onComparisonToggle={handleComparisonToggle}
                comparisonDisabled={!selectedForComparison.includes(match.trainer.id) && selectedForComparison.length >= 4}
              />
              
              {/* CTAs */}
              {renderCTAs(match.trainer)}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedGoal("all");
                setSelectedLocation("all");
                setSelectedAvailability("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}