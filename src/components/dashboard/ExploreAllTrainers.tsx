import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useEngagementStage } from "@/hooks/useEngagementStage";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EnhancedTrainerCard } from "@/components/trainer-cards/EnhancedTrainerCard";
import { FilterSection } from "@/components/FilterSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, 
  Grid3X3,
  List,
  Target,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
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
  const { user } = useAuth();
  const { saveTrainer, isTrainerSaved } = useSavedTrainers();
  const { shortlistTrainer, isShortlisted, shortlistCount, canShortlistMore } = useShortlistedTrainers();
  
  // State for trainers and pagination
  const [allTrainers, setAllTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const trainersPerPage = 10;
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [activeFilters, setActiveFilters] = useState<{
    trainingType: string;
    experience: string;
    rating: string;
    priceRange: number[];
    selectedSpecialties: string[];
  }>({
    trainingType: "",
    experience: "",
    rating: "",
    priceRange: [25, 150],
    selectedSpecialties: []
  });

  // Handle filter changes from FilterSection
  const handleFiltersChange = useCallback((filters: any) => {
    setActiveFilters(filters);
  }, []);

  // Fetch all published trainers excluding those with engagement
  useEffect(() => {
    const fetchAllTrainers = async () => {
      try {
        setLoading(true);
        
        // Get all published trainers
        const { data: trainersData, error } = await supabase
          .from('v_trainers')
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
            profile_image_position,
            training_types,
            testimonials
          `)
          .eq('profile_published', true);

        if (error) {
          console.error('Error fetching trainers in ExploreAllTrainers:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          return;
        }

        // Filter out trainers in limited mode
        let filteredTrainersData = trainersData || [];
        if (trainersData && trainersData.length > 0) {
          const trainerIds = trainersData.map(t => t.id);
          const { data: memberships } = await supabase
            .from('trainer_membership')
            .select('trainer_id, payment_status')
            .in('trainer_id', trainerIds)
            .eq('is_active', true);

          const limitedModeIds = new Set(
            (memberships || [])
              .filter(m => m.payment_status === 'limited_mode')
              .map(m => m.trainer_id)
          );

          filteredTrainersData = trainersData.filter(t => !limitedModeIds.has(t.id));
        }

        // If user is authenticated, exclude trainers with existing engagement
        let excludedTrainerIds: string[] = [];
        if (user) {
          const { data: engagements } = await supabase
            .from('client_trainer_engagement')
            .select('trainer_id, stage')
            .eq('client_id', user.id);
          
          // Exclude trainers with any engagement stage (liked or higher)
          excludedTrainerIds = (engagements || [])
            .filter(e => e.stage !== 'browsing')
            .map(e => e.trainer_id);
        }

        // Filter out trainers with engagement
        filteredTrainersData = filteredTrainersData.filter(
          trainer => !excludedTrainerIds.includes(trainer.id)
        );

        const trainers = filteredTrainersData.map((trainer, index) => {
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
            profilePhotoUrl: trainer.profile_photo_url,
            profileImagePosition: trainer.profile_image_position 
              ? (typeof trainer.profile_image_position === 'string' 
                  ? JSON.parse(trainer.profile_image_position)
                  : trainer.profile_image_position) as { x: number; y: number; scale: number }
              : { x: 50, y: 50, scale: 1 },
            certifications: trainer.qualifications || [],
            description: trainer.bio || "Professional fitness trainer dedicated to helping you achieve your goals.",
            availability: "Available",
            trainingType: trainer.training_types || ["In-Person", "Online"],
            offers_discovery_call: false,
            testimonials: (trainer.testimonials as any[]) || []
          };
        });

        setAllTrainers(trainers);
      } catch (error) {
        console.error('Error fetching trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTrainers();
  }, [user]);

  // Listen for engagement updates to remove saved/engaged trainers instantly
  useEffect(() => {
    const handleEngagementUpdate = (e: Event) => {
      const event = e as CustomEvent<{ trainerId: string; stage: string }>;
      const { trainerId, stage } = event.detail || {} as any;
      
      // Remove trainer from list if they're no longer browsing
      if (trainerId && stage && stage !== 'browsing') {
        setAllTrainers(prev => prev.filter(t => t.id !== trainerId));
      }
    };

    window.addEventListener('engagementStageUpdated', handleEngagementUpdate as EventListener);
    return () => {
      window.removeEventListener('engagementStageUpdated', handleEngagementUpdate as EventListener);
    };
  }, []);

  // Filter trainers based on search and comprehensive filters
  const filteredTrainers = useMemo(() => {
    return allTrainers.filter(trainer => {
      // Search filter
      const matchesSearch = !searchTerm || 
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialties.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Training type filter
      const matchesTrainingType = !activeFilters.trainingType || 
        trainer.trainingType?.some((type: string) => 
          type.toLowerCase().includes(activeFilters.trainingType.toLowerCase()) ||
          (activeFilters.trainingType === "online" && type.toLowerCase() === "virtual") ||
          (activeFilters.trainingType === "in-person" && type.toLowerCase().includes("person"))
        );
      
      // Experience filter (parse years from experience string or use a default)
      const matchesExperience = !activeFilters.experience || (() => {
        // For now, we'll assume all verified professionals have 5+ years
        // This can be enhanced when experience_years is added to the trainer data
        if (activeFilters.experience === "10+") return trainer.experience?.includes("Verified");
        return true;
      })();
      
      // Rating filter
      const matchesRating = !activeFilters.rating || 
        trainer.rating >= parseFloat(activeFilters.rating);
      
      // Price range filter
      const matchesPriceRange = 
        trainer.hourlyRate >= activeFilters.priceRange[0] && 
        trainer.hourlyRate <= activeFilters.priceRange[1];
      
      // Specialties filter
      const matchesSpecialties = activeFilters.selectedSpecialties.length === 0 || 
        activeFilters.selectedSpecialties.some(specialty => 
          trainer.specialties.some((spec: string) => 
            spec.toLowerCase().includes(specialty.toLowerCase())
          )
        );
      
      return matchesSearch && matchesTrainingType && matchesExperience && 
             matchesRating && matchesPriceRange && matchesSpecialties;
    });
  }, [allTrainers, searchTerm, activeFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTrainers.length / trainersPerPage);
  const startIndex = (currentPage - 1) * trainersPerPage;
  const endIndex = startIndex + trainersPerPage;
  const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  const handleViewProfile = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  const handleMessage = (trainerId: string) => {
    const event = new CustomEvent('openMessagePopup', {
      detail: { trainerId }
    });
    window.dispatchEvent(event);
  };

  const handleSaveTrainer = async (trainerId: string) => {
    console.log('🔥 Save trainer clicked:', trainerId);
    
    // Optimistic UI update - remove trainer from list immediately
    setAllTrainers(prev => prev.filter(t => t.id !== trainerId));
    
    try {
      const result = await saveTrainer(trainerId);
      if (result) {
        toast.success('Trainer saved!');
      } else {
        toast.error('Failed to save trainer');
        // Rollback on error - refetch to restore state
        const { data: trainersData } = await supabase
          .from('v_trainers')
          .select('*')
          .eq('profile_published', true);
        if (trainersData) {
          setAllTrainers(trainersData.map((trainer, index) => ({
            id: trainer.id,
            name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Professional Trainer',
            // ... rest of mapping
          })));
        }
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
      {/* Header with Search */}
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
                Page {currentPage} of {totalPages || 1}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search trainers by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTrainers.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredTrainers.length)} of {filteredTrainers.length} trainers
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

      {/* Comprehensive Filter Section */}
      {showFilters && (
        <FilterSection onFiltersChange={handleFiltersChange} />
      )}

      {/* Trainers Grid/List */}
      {paginatedTrainers.length > 0 ? (
        <>
          <div className={viewMode === 'grid' ? "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
            {paginatedTrainers.map((trainer) => (
              <div key={trainer.id} className="space-y-3">
                <EnhancedTrainerCard
                  trainer={trainer}
                  layout="grid"
                  onViewProfile={handleViewProfile}
                  onStartConversation={handleMessage}
                  cardState={
                    isShortlisted(trainer.id) ? "shortlisted" : 
                    isTrainerSaved(trainer.id) ? "saved" : 
                    "default"
                  }
                  showComparisonCheckbox={false}
                />
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
                setActiveFilters({
                  trainingType: "",
                  experience: "",
                  rating: "",
                  priceRange: [25, 150],
                  selectedSpecialties: []
                });
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