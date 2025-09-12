import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MapPin, Star, ArrowLeft, MessageCircle, Calendar, Trash2 } from "lucide-react";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { AuthPrompt } from "@/components/anonymous/AuthPrompt";
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

export default function AnonymousShortlist() {
  const navigate = useNavigate();
  const { session, unsaveTrainer, savedTrainersCount } = useAnonymousSession();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'message' | 'book'>('message');

  useEffect(() => {
    if (session?.savedTrainers.length > 0) {
      fetchSavedTrainers();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchSavedTrainers = async () => {
    if (!session?.savedTrainers.length) return;

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
        .in('id', session.savedTrainers)
        .eq('profile_published', true)
        .eq('is_verified', true);

      if (error) throw error;
      setTrainers(data || []);
    } catch (error) {
      console.error('Error fetching saved trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrainer = (trainerId: string) => {
    unsaveTrainer(trainerId);
    setTrainers(prev => prev.filter(t => t.id !== trainerId));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your saved trainers...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Browse
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-semibold">Your Saved Trainers</span>
                <Badge variant="secondary">{savedTrainersCount}</Badge>
              </div>
            </div>
            
            <Button onClick={() => navigate('/auth?signup=true')}>
              Create Account to Keep Forever
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {trainers.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Saved Trainers Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start browsing to save trainers you're interested in
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Trainers
            </Button>
          </div>
        ) : (
          <>
            {/* Session Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Heart className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800">Temporary Storage</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Your saved trainers are stored locally for 7 days. Create a free account to keep them forever and unlock messaging & booking.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => navigate('/auth?signup=true')}
                  >
                    Create Free Account
                  </Button>
                </div>
              </div>
            </div>

            {/* Trainers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Remove Button */}
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTrainer(trainer.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

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
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleMessageClick(trainer.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBookClick(trainer.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-2">Ready to Connect?</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your free account to message trainers, book sessions, and keep your shortlist forever.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth?signup=true')}
                    className="px-8"
                  >
                    Create Free Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* Auth Prompt */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        actionType={actionType}
        trainerName={trainers.find(t => t.id === selectedTrainerId)?.first_name || ''}
      />
    </div>
  );
}