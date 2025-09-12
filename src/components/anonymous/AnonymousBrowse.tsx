import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MapPin, Star, Users, Calendar, MessageCircle } from "lucide-react";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { SaveTrainerPrompt } from "./SaveTrainerPrompt";
import { AuthPrompt } from "./AuthPrompt";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
  hourly_rate: number;
  free_discovery_call: boolean;
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
          <Card key={trainer.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Trainer Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={trainer.profile_photo_url} />
                  <AvatarFallback>
                    {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {trainer.first_name} {trainer.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {trainer.tagline}
                  </p>
                  
                  {/* Location and Rating */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{trainer.location}</span>
                    </div>
                    {trainer.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{trainer.rating.toFixed(1)}</span>
                        <span className="text-xs">({trainer.total_ratings})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {trainer.specializations?.slice(0, 3).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {trainer.specializations?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{trainer.specializations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Coaching Style */}
              {trainer.coaching_style?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Coaching Style:</p>
                  <p className="text-sm">
                    {trainer.coaching_style.slice(0, 2).join(', ')}
                    {trainer.coaching_style.length > 2 && '...'}
                  </p>
                </div>
              )}

              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">£{trainer.hourly_rate}</span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </div>
                  {trainer.free_discovery_call && (
                    <Badge variant="outline" className="text-xs">
                      Free discovery call
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant={isTrainerSaved(trainer.id) ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSaveClick(trainer.id)}
                  disabled={isTrainerSaved(trainer.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isTrainerSaved(trainer.id) ? 'fill-current' : ''}`} />
                  {isTrainerSaved(trainer.id) ? 'Saved' : 'Save'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMessageClick(trainer.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBookClick(trainer.id)}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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