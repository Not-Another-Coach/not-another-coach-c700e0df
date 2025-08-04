import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useShortlistedTrainers } from '@/hooks/useShortlistedTrainers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Scale, Trash2, Star, MessageCircle, Phone } from 'lucide-react';
import { TrainerCard, Trainer } from '@/components/TrainerCard';
import { ComparisonView } from '@/components/ComparisonView';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Sample trainer data (in real app, this would come from API)
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";
import trainerAlex from "@/assets/trainer-alex.jpg";

const sampleTrainers: Trainer[] = [
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
    description: "Certified yoga instructor focusing on mind-body connection and flexibility.",
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

export default function SavedTrainers() {
  const navigate = useNavigate();
  const { savedTrainers, loading, unsaveTrainer } = useSavedTrainers();
  const { shortlistTrainer, isShortlisted, shortlistCount, canShortlistMore } = useShortlistedTrainers();
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [allTrainers, setAllTrainers] = useState<(Trainer & { savedInfo: any })[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);

  // Fetch real trainer data from database and combine with sample data
  useEffect(() => {
    const fetchTrainerDetails = async () => {
      if (savedTrainers.length === 0) {
        setAllTrainers([]);
        setLoadingTrainers(false);
        return;
      }

      try {
        const trainerDetails: (Trainer & { savedInfo: any })[] = [];
        
        // Process each saved trainer
        for (const saved of savedTrainers) {
          // First check sample data
          const sampleTrainer = sampleTrainers.find(t => t.id === saved.trainer_id);
          
          if (sampleTrainer) {
            trainerDetails.push({ ...sampleTrainer, savedInfo: saved });
          } else {
            // If not in sample data, fetch from database
            const { data: dbTrainer } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, bio, location, specializations, training_types, hourly_rate, rating, total_ratings, profile_photo_url, is_verified, tagline')
              .eq('id', saved.trainer_id)
              .eq('user_type', 'trainer')
              .single();

            if (dbTrainer) {
              // Convert database trainer to Trainer format
              const convertedTrainer: Trainer = {
                id: dbTrainer.id,
                name: `${dbTrainer.first_name} ${dbTrainer.last_name}`,
                specialties: dbTrainer.specializations || [],
                rating: Number(dbTrainer.rating) || 0,
                reviews: dbTrainer.total_ratings || 0,
                experience: "Professional trainer", // Default since we don't have this field
                location: dbTrainer.location || "Location not specified",
                hourlyRate: Number(dbTrainer.hourly_rate) || 0,
                image: dbTrainer.profile_photo_url || "/placeholder.svg",
                certifications: [], // Default since we don't have this field
                description: dbTrainer.bio || "Professional fitness trainer",
                availability: "Contact for availability", // Default
                trainingType: dbTrainer.training_types || ["In-Person"]
              };
              trainerDetails.push({ ...convertedTrainer, savedInfo: saved });
            }
          }
        }

        setAllTrainers(trainerDetails);
      } catch (error) {
        console.error('Error fetching trainer details:', error);
      } finally {
        setLoadingTrainers(false);
      }
    };

    fetchTrainerDetails();
  }, [savedTrainers]);

  const handleToggleComparison = (trainerId: string, checked: boolean) => {
    if (checked) {
      if (selectedForComparison.length < 4) {
        setSelectedForComparison(prev => [...prev, trainerId]);
      }
    } else {
      setSelectedForComparison(prev => prev.filter(id => id !== trainerId));
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
    }
  };

  const handleStartComparison = () => {
    if (selectedForComparison.length >= 2) {
      setShowComparison(true);
    }
  };

  const selectedTrainers = selectedForComparison.map(id => 
    allTrainers.find(t => t.id === id)
  ).filter(Boolean) as Trainer[];

  if (loading || loadingTrainers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading saved trainers...</p>
        </div>
      </div>
    );
  }

  if (showComparison) {
    return (
      <ComparisonView
        trainers={selectedTrainers}
        onClose={() => setShowComparison(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Saved Trainers
                </h1>
                <p className="text-muted-foreground">
                  {allTrainers.length} trainer{allTrainers.length !== 1 ? 's' : ''} saved • Trainers you liked or swiped right on
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Shortlisted: {shortlistCount}/4 trainers
                </p>
              </div>
            </div>

            {selectedForComparison.length >= 2 && (
              <Button onClick={handleStartComparison} className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Compare ({selectedForComparison.length})
              </Button>
            )}
          </div>

          {/* Comparison Selection Info */}
          {allTrainers.length >= 2 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Select 2-4 trainers to compare them side by side
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedForComparison.map(id => {
                  const trainer = allTrainers.find(t => t.id === id);
                  return trainer ? (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {trainer.name}
                      <button 
                        onClick={() => handleToggleComparison(id, false)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {allTrainers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Saved Trainers Yet</CardTitle>
              <CardDescription className="mb-6">
                Start exploring trainers and like them or swipe right to add them here. You can then shortlist up to 4 trainers to unlock chat and discovery call options.
              </CardDescription>
              <Button onClick={() => navigate('/discovery')}>
                Discover Trainers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTrainers.map((trainer) => (
              <div key={trainer.id} className="relative">
                {/* Comparison Checkbox */}
                {allTrainers.length >= 2 && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
                      <Checkbox
                        checked={selectedForComparison.includes(trainer.id)}
                        onCheckedChange={(checked) => 
                          handleToggleComparison(trainer.id, checked as boolean)
                        }
                        disabled={!selectedForComparison.includes(trainer.id) && selectedForComparison.length >= 4}
                      />
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => unsaveTrainer(trainer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <TrainerCard
                  trainer={trainer}
                  onViewProfile={(id) => console.log('View profile:', id)}
                />

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {isShortlisted(trainer.id) ? (
                    <div className="space-y-2">
                      <Badge variant="default" className="w-full justify-center bg-green-100 text-green-800 border-green-200">
                        ✓ Shortlisted
                      </Badge>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          Book Call
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="w-full"
                      onClick={() => handleShortlist(trainer.id)}
                      disabled={!canShortlistMore}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {canShortlistMore ? 'Add to Shortlist' : 'Shortlist Full'}
                    </Button>
                  )}
                </div>

                {/* Saved Date */}
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Saved {new Date(trainer.savedInfo.saved_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}