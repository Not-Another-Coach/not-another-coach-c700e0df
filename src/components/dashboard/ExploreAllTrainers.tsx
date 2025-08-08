import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrainerCard } from "@/components/TrainerCard";
import { ComparisonView } from "@/components/ComparisonView";
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
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Fallback images for trainers
import trainerAlex from "@/assets/trainer-alex.jpg";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

const trainerImages = [trainerAlex, trainerSarah, trainerMike, trainerEmma];

interface ExploreAllTrainersProps {
  profile: any;
}

export function ExploreAllTrainers({ profile }: ExploreAllTrainersProps) {
  const navigate = useNavigate();
  const { saveTrainer, isTrainerSaved } = useSavedTrainers();
  const { shortlistTrainer, isShortlisted, shortlistCount, canShortlistMore } = useShortlistedTrainers();
  
  // State for trainers and pagination
  const [allTrainers, setAllTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const trainersPerPage = 10;
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Comparison functionality
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch all published trainers
  useEffect(() => {
    const fetchAllTrainers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            bio,
            location,
            specializations,
            qualifications,
            hourly_rate,
            rating,
            total_ratings,
            is_verified,
            profile_photo_url,
            training_types,
            discovery_call_settings(offers_discovery_call),
          `)
          .eq('user_type', 'trainer')
          .eq('profile_published', true)
          .order('created_at');

        if (error) {
          console.error('Error fetching trainers:', error);
          return;
        }

        const trainers = data?.map((trainer, index) => {
          // Use profile photo if available, otherwise use fallback image
          const imageUrl = trainer.profile_photo_url || trainerImages[index % trainerImages.length];
          
          return {
            id: trainer.id,
            name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Professional Trainer',
            specialties: trainer.specializations || [],
            rating: trainer.rating || 4.5,
            reviews: trainer.total_ratings || 0,
            experience: trainer.is_verified ? "Verified Professional" : "Professional",
            location: trainer.location || "Location TBD",
            hourlyRate: trainer.hourly_rate || 75,
            image: imageUrl,
            certifications: trainer.qualifications || [],
            description: trainer.bio || "Professional fitness trainer dedicated to helping you achieve your goals.",
            availability: "Available",
            trainingType: trainer.training_types || ["In-Person", "Online"],
            offers_discovery_call: trainer.discovery_call_settings?.[0]?.offers_discovery_call || false
          };
        }) || [];

        setAllTrainers(trainers);
      } catch (error) {
        console.error('Error fetching trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTrainers();
  }, []);

  // Filter trainers based on search and filters
  const filteredTrainers = useMemo(() => {
    return allTrainers.filter(trainer => {
      const matchesSearch = !searchTerm || 
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialties.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGoal = selectedGoal === "all" || 
        trainer.specialties.some((spec: string) => spec.toLowerCase().includes(selectedGoal.toLowerCase()));
      
      const matchesLocation = selectedLocation === "all" || 
        trainer.location.toLowerCase().includes(selectedLocation.toLowerCase());
      
      return matchesSearch && matchesGoal && matchesLocation;
    });
  }, [allTrainers, searchTerm, selectedGoal, selectedLocation]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTrainers.length / trainersPerPage);
  const startIndex = (currentPage - 1) * trainersPerPage;
  const endIndex = startIndex + trainersPerPage;
  const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGoal, selectedLocation, selectedAvailability]);

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
    return paginatedTrainers.filter(trainer => selectedForComparison.includes(trainer.id));
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="w-8 h-8"
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
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

  if (loading) {
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
              Explore All Trainers
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredTrainers.length} trainers
              </Badge>
              <Badge variant="secondary">
                Page {currentPage} of {totalPages}
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
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTrainers.length)} of {filteredTrainers.length} trainers
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

      {/* Trainers Grid/List */}
      {paginatedTrainers.length > 0 ? (
        <>
          <div className={viewMode === 'grid' ? "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
            {paginatedTrainers.map((trainer) => (
              <div key={trainer.id} className="space-y-3">
                <TrainerCard
                  trainer={trainer}
                  onViewProfile={handleViewProfile}
                  cardState={
                    isShortlisted(trainer.id) ? "shortlisted" : 
                    isTrainerSaved(trainer.id) ? "saved" : 
                    "default"
                  }
                  showComparisonCheckbox={true}
                  comparisonChecked={selectedForComparison.includes(trainer.id)}
                  onComparisonToggle={handleComparisonToggle}
                  comparisonDisabled={!selectedForComparison.includes(trainer.id) && selectedForComparison.length >= 4}
                />
                
                {/* CTAs */}
                {renderCTAs(trainer)}
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
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