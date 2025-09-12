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
}

export const AnonymousBrowse = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'message' | 'book' | 'profile'>('message');
  
  const { savedTrainersCount, savedTrainerIds } = useAnonymousSession();
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
          free_discovery_call
        `)
        .eq('profile_published', true)
        .not('specializations', 'is', null)
        .limit(12);

      if (error) throw error;
      console.log('🔍 AnonymousBrowse: Fetched trainers:', data?.length || 0);
      
      // Filter out saved trainers for anonymous users
      const filteredTrainers = (data || []).filter(trainer => 
        !savedTrainerIds.includes(trainer.id)
      );
      
      setTrainers(filteredTrainers);
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
      {/* Header with saved count */}
      {savedTrainersCount > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-primary text-primary" />
              <span className="font-medium">
                You've saved {savedTrainersCount} coach{savedTrainersCount > 1 ? 'es' : ''} — create an account to keep them.
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/auth?signup=true')}
            >
              Create Account
            </Button>
          </div>
        </div>
      )}

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainers.map((trainer) => {
          console.log('🎯 Rendering trainer card for:', trainer.first_name, trainer.last_name);
          
          // Transform trainer data to match AnyTrainer interface
          const enhancedTrainer: AnyTrainer = {
            ...trainer,
            name: `${trainer.first_name} ${trainer.last_name}`,
            firstName: trainer.first_name,
            lastName: trainer.last_name,
            profilePhotoUrl: trainer.profile_photo_url,
            totalRatings: trainer.total_ratings,
            hourlyRate: trainer.hourly_rate,
            freeDiscoveryCall: trainer.free_discovery_call
          };
          
          return (
            <EnhancedTrainerCard
              key={trainer.id}
              trainer={enhancedTrainer}
              config="explore"
              initialView="instagram"
              onViewProfile={() => handleViewProfileClick(trainer.id)}
              onMessage={() => handleMessageClick(trainer.id)}
              onBookDiscoveryCall={() => handleBookClick(trainer.id)}
            />
          );
        })}
      </div>

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