import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedTrainerCard } from "@/components/trainer-cards/EnhancedTrainerCard";
import { ChevronLeft, ChevronRight, Compass, Star, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { toast } from "sonner";

// Fallback images for trainers
import trainerAlex from "@/assets/trainer-alex.jpg";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

const trainerImages = [trainerAlex, trainerSarah, trainerMike, trainerEmma];

interface ExploreTrainer {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialties: string[];
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  hourlyRate: number;
  image: string;
  profilePhotoUrl?: string;
  profileImagePosition?: { x: number; y: number; scale: number };
  certifications: string[];
  description: string;
  availability: string;
  trainingType: string[];
  offers_discovery_call?: boolean;
  testimonials?: any[];
}

interface ExploreSectionProps {
  isActiveClient: boolean;
  journeyProgress?: { stage: string } | null;
}

export function ExploreSection({ isActiveClient, journeyProgress }: ExploreSectionProps) {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<ExploreTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { saveTrainer, isTrainerSaved } = useSavedTrainers();
  const { shortlistTrainer, isShortlisted } = useShortlistedTrainers();

  // Fetch a subset of trainers for dashboard preview
  useEffect(() => {
    const fetchExplorableTrainers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
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
          .eq('profile_published', true)
          .order('rating', { ascending: false })
          .limit(8); // Fetch 8 potential matches for carousel

        if (error) {
          console.error('Error fetching trainers for explore section:', error);
          return;
        }

        const formattedTrainers = data?.map((trainer, index) => {
          const imageUrl = trainer.profile_photo_url || trainerImages[index % trainerImages.length];
          
          return {
            id: trainer.id,
            name: `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Professional Trainer',
            firstName: trainer.first_name,
            lastName: trainer.last_name,
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
            offers_discovery_call: true,
            testimonials: (trainer.testimonials as any[]) || []
          };
        }) || [];

        setTrainers(formattedTrainers);
      } catch (error) {
        console.error('Error fetching trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorableTrainers();
  }, []);

  // Auto-carousel functionality
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < trainers.length - 1 ? prev + 1 : 0));
  }, [trainers.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : trainers.length - 1));
  }, [trainers.length]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || isPaused || trainers.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000); // Change trainer every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, trainers.length, goToNext]);

  // Pause auto-play on hover/interaction
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const toggleAutoPlay = () => setIsAutoPlaying(!isAutoPlaying);

  const handlePrevTrainer = () => {
    setIsPaused(true);
    goToPrev();
    // Resume auto-play after 3 seconds of no interaction
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleNextTrainer = () => {
    setIsPaused(true);
    goToNext();
    // Resume auto-play after 3 seconds of no interaction
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleAddToShortlist = async (trainerId: string) => {
    try {
      await shortlistTrainer(trainerId);
      toast.success("Trainer added to your shortlist!");
    } catch (error) {
      console.error('Error shortlisting trainer:', error);
      toast.error("Failed to add trainer to shortlist");
    }
  };

  const handleViewProfile = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  const handleStartConversation = (trainerId: string) => {
    // Navigate to messaging or open chat
    navigate(`/messages?trainer=${trainerId}`);
  };

  const handleBookDiscoveryCall = (trainerId: string) => {
    // Navigate to booking flow
    navigate(`/book-discovery-call/${trainerId}`);
  };

  // Don't show if user is an active client
  if (isActiveClient) {
    return null;
  }

  // Show "Ready to Explore" state for users in exploring_coaches stage
  if (journeyProgress?.stage === 'exploring_coaches') {
    return (
      <Card 
        className="border-secondary-200 bg-gradient-to-br from-secondary-50 to-accent-50 cursor-pointer hover:shadow-lg transition-all duration-300"
        onClick={() => navigate('/discovery')}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-secondary-600" />
              Potential Matches for You
            </div>
            {trainers.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAutoPlay();
                }}
                className="h-8 w-8 p-0"
              >
                {isAutoPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Loading top trainers...</div>
            </div>
          ) : trainers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Based on your preferences, here are some great matches:
                </p>
                {isAutoPlaying && !isPaused && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    Auto-playing
                  </Badge>
                )}
              </div>
              
              {/* Trainer Carousel */}
              <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="overflow-hidden rounded-lg">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {trainers.map((trainer) => (
                      <div key={trainer.id} className="w-full flex-shrink-0">
                        <EnhancedTrainerCard
                          trainer={trainer}
                          onViewProfile={handleViewProfile}
                          onAddToShortlist={handleAddToShortlist}
                          onStartConversation={handleStartConversation}
                          onBookDiscoveryCall={handleBookDiscoveryCall}
                          isShortlisted={isShortlisted(trainer.id)}
                          trainerOffersDiscoveryCalls={trainer.offers_discovery_call}
                          initialView="instagram"
                          matchScore={Math.floor(75 + Math.random() * 20)} // Generate match scores between 75-95%
                          matchReasons={["Great specialty match", "Excellent ratings", "Available times"]}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation buttons */}
                {trainers.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 backdrop-blur hover:bg-white shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevTrainer();
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 backdrop-blur hover:bg-white shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextTrainer();
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Trainer indicators */}
                {trainers.length > 1 && (
                  <div className="flex justify-center gap-1 mt-3">
                    {trainers.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex 
                            ? 'bg-secondary-600 w-4' 
                            : 'bg-secondary-300 hover:bg-secondary-400'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(index);
                          setIsPaused(true);
                          setTimeout(() => setIsPaused(false), 3000);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Match {currentIndex + 1} of {trainers.length}
                  </Badge>
                  {isAutoPlaying && (
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary-600 rounded-full animate-pulse"
                        style={{
                          width: isPaused ? '100%' : '0%',
                          transition: isPaused ? 'none' : 'width 4s linear'
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Star className="h-3 w-3 mr-1" />
                  Explore All ({trainers.length}+)
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Great job completing your fitness preferences! Now let's find the perfect trainer for you.
              </p>
              <Button size="lg">
                Start Exploring Trainers
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}