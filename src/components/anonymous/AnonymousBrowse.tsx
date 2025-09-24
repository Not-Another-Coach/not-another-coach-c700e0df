import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { AuthPrompt } from "./AuthPrompt";
import { EnhancedTrainerCard } from "@/components/trainer-cards/EnhancedTrainerCard";
import type { AnyTrainer } from "@/types/trainer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  tagline: string;
  location: string;
  specializations: string[];
  coaching_style: string[];
  rating: number;
  total_ratings: number;
  profile_photo_url: string;
  hourly_rate: number | null;
  free_discovery_call: boolean | null;
  testimonials: any[];
}

export const AnonymousBrowse = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'message' | 'book' | 'profile'>('message');
  
  const { savedTrainerIds } = useAnonymousSession();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainers();
  }, [savedTrainerIds]);

  const fetchTrainers = async () => {
    console.log('🔍 AnonymousBrowse: Fetching trainers...');
    try {
      const { data, error } = await supabase
        .from('v_trainers')
        .select(`
          id,
          first_name,
          last_name,
          tagline,
          location,
          specializations,
          coaching_style,
          rating,
          total_ratings,
          profile_photo_url,
          hourly_rate,
          free_discovery_call,
          testimonials
        `)
        .eq('profile_published', true)
        .not('specializations', 'is', null)
        .limit(12);

      if (error) throw error;
      console.log('🔍 AnonymousBrowse: Fetched trainers:', data?.length || 0);
      
      setTrainers((data || []) as Trainer[]);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    setActionType('message');
    setShowAuthPrompt(true);
  };

  const handleBookClick = (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    setActionType('book');
    setShowAuthPrompt(true);
  };

  const handleViewProfileClick = (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    setActionType('profile');
    setShowAuthPrompt(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading trainers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trainers Grid */}
      {trainers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trainers.map((trainer) => {
          console.log('🎯 Rendering trainer card for anonymized view');
          
          // Transform trainer data to match AnyTrainer interface
          // Note: Don't construct the name directly - let visibility system handle it
          const enhancedTrainer: AnyTrainer = {
            ...trainer,
            name: `${trainer.first_name} ${trainer.last_name}`, // This will be overridden by visibility system
            firstName: trainer.first_name,
            lastName: trainer.last_name,
            profilePhotoUrl: trainer.profile_photo_url,
            totalRatings: trainer.total_ratings,
            hourlyRate: trainer.hourly_rate,
            freeDiscoveryCall: trainer.free_discovery_call,
            testimonials: trainer.testimonials || []
          };
          
          return (
                <EnhancedTrainerCard
                  key={trainer.id}
                  trainer={enhancedTrainer}
                  config="anonymous"
                  initialView="instagram"
                  showComparisonCheckbox={false}
                  onViewProfile={() => handleViewProfileClick(trainer.id)}
                  onMessage={() => handleMessageClick(trainer.id)}
                  onBookDiscoveryCall={() => handleBookClick(trainer.id)}
                />
            );
          })}
        </div>
      ) : (
        /* Animated placeholder when no coaches available */
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="relative">
            <div className="animate-pulse">
              <Heart className="h-16 w-16 text-primary/20 mb-4" />
            </div>
            <div className="absolute inset-0 animate-ping">
              <Heart className="h-16 w-16 text-primary/10" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-muted-foreground mb-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
            All coaches discovered!
          </h3>
          <p className="text-muted-foreground text-center max-w-md animate-fade-in" style={{animationDelay: '0.4s'}}>
            You've seen all available coaches. Create an account to save your favorites and get matched with more trainers.
          </p>
          <Button 
            className="mt-6 animate-scale-in hover-scale" 
            style={{animationDelay: '0.6s'}}
            onClick={() => navigate('/auth?signup=true')}
          >
            Create Account to See More
          </Button>
        </div>
      )}

      {/* Conversion Prompts */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        actionType={actionType}
        trainerName={trainers.find(t => t.id === selectedTrainerId)?.first_name || ''}
      />
    </div>
  );
};