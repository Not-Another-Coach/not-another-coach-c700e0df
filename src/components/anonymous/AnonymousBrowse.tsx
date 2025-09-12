import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { SaveTrainerPrompt } from "./SaveTrainerPrompt";
import { AuthPrompt } from "./AuthPrompt";
import { UnifiedTrainerCard } from "@/components/shared/UnifiedTrainerCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'save' | 'message' | 'book'>('save');
  
  const { saveTrainer, isTrainerSaved, savedTrainersCount } = useAnonymousSession();

  useEffect(() => {
    fetchTrainers();
  }, []);

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
      setTrainers(data || []);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (trainerId: string) => {
    if (isTrainerSaved(trainerId)) {
      // Already saved, show saved state
      return;
    }
    
    setSelectedTrainerId(trainerId);
    setActionType('save');
    setShowSavePrompt(true);
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

  const handleSaveConfirm = () => {
    if (selectedTrainerId) {
      saveTrainer(selectedTrainerId);
      setShowSavePrompt(false);
      setSelectedTrainerId(null);
    }
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
                You've saved {savedTrainersCount} trainer{savedTrainersCount > 1 ? 's' : ''}
              </span>
            </div>
            <Button variant="outline" size="sm">
              Create account to keep them
            </Button>
          </div>
        </div>
      )}

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <UnifiedTrainerCard
            key={trainer.id}
            trainer={trainer}
            onSave={handleSaveClick}
            onMessage={handleMessageClick}
            onBook={handleBookClick}
            isSaved={isTrainerSaved(trainer.id)}
            isAuthenticated={false}
          />
        ))}
      </div>

      {/* Conversion Prompts */}
      <SaveTrainerPrompt
        isOpen={showSavePrompt}
        onClose={() => setShowSavePrompt(false)}
        onConfirm={handleSaveConfirm}
        trainerName={trainers.find(t => t.id === selectedTrainerId)?.first_name || ''}
      />

      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        actionType={actionType}
        trainerName={trainers.find(t => t.id === selectedTrainerId)?.first_name || ''}
      />
    </div>
  );
};