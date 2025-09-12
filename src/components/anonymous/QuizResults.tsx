import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  MapPin, 
  Star, 
  MessageCircle, 
  Calendar, 
  ArrowLeft,
  Target,
  Sparkles,
  Lock,
  Users
} from "lucide-react";
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
  match_score?: number;
}

interface QuizResultsProps {
  onBack: () => void;
}

export const QuizResults = ({ onBack }: QuizResultsProps) => {
  const navigate = useNavigate();
  const { session, saveTrainer, isTrainerSaved } = useAnonymousSession();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'save' | 'message' | 'book'>('save');
  const [showAllMatches, setShowAllMatches] = useState(false);

  useEffect(() => {
    if (session?.quizResults) {
      fetchMatchedTrainers();
    }
  }, [session]);

  const calculateMatchScore = (trainer: Trainer) => {
    if (!session?.quizResults) return 0;
    
    let score = 0;
    let maxScore = 0;

    // Goal matching (40% weight)
    const goalWeight = 40;
    maxScore += goalWeight;
    
    if (trainer.specializations && session.quizResults.goals) {
      const goalKeywords = {
        weight_loss: ['weight loss', 'fat loss', 'body composition'],
        muscle_building: ['muscle building', 'strength training', 'bodybuilding'],
        general_fitness: ['general fitness', 'health', 'wellness'],
        sports_performance: ['sports performance', 'athletic', 'performance'],
        flexibility: ['flexibility', 'mobility', 'yoga', 'stretching'],
        rehabilitation: ['rehabilitation', 'injury', 'recovery', 'physiotherapy']
      };

      let goalMatches = 0;
      session.quizResults.goals.forEach(goal => {
        const keywords = goalKeywords[goal as keyof typeof goalKeywords] || [];
        const hasMatch = trainer.specializations.some(spec => 
          keywords.some(keyword => spec.toLowerCase().includes(keyword.toLowerCase()))
        );
        if (hasMatch) goalMatches++;
      });
      
      score += (goalMatches / Math.max(session.quizResults.goals.length, 1)) * goalWeight;
    }

    // Coaching style matching (30% weight)
    const styleWeight = 30;
    maxScore += styleWeight;
    
    if (trainer.coaching_style && session.quizResults.coachingStyle) {
      let styleMatches = 0;
      session.quizResults.coachingStyle.forEach(style => {
        const hasMatch = trainer.coaching_style.some(trainerStyle => 
          trainerStyle.toLowerCase().includes(style.toLowerCase())
        );
        if (hasMatch) styleMatches++;
      });
      
      score += (styleMatches / Math.max(session.quizResults.coachingStyle.length, 1)) * styleWeight;
    }

    // Budget matching (20% weight)
    const budgetWeight = 20;
    maxScore += budgetWeight;
    
    if (session.quizResults.budget && trainer.hourly_rate) {
      const budgetRanges = {
        '0-50': [0, 50],
        '50-80': [50, 80],
        '80-120': [80, 120],
        '120+': [120, 1000]
      };
      
      const range = budgetRanges[session.quizResults.budget as keyof typeof budgetRanges];
      if (range && trainer.hourly_rate >= range[0] && trainer.hourly_rate <= range[1]) {
        score += budgetWeight;
      }
    }

    // Location matching (10% weight)
    const locationWeight = 10;
    maxScore += locationWeight;
    
    if (session.quizResults.location && trainer.location) {
      if (session.quizResults.location === 'online' || 
          trainer.location.toLowerCase().includes(session.quizResults.location.toLowerCase())) {
        score += locationWeight;
      }
    }

    return Math.round((score / maxScore) * 100);
  };

  const fetchMatchedTrainers = async () => {
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
        .limit(20);

      if (error) throw error;
      
      // Calculate match scores and sort
      const trainersWithScores = (data || []).map(trainer => ({
        ...trainer,
        match_score: calculateMatchScore(trainer)
      })).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      setTrainers(trainersWithScores);
    } catch (error) {
      console.error('Error fetching matched trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (trainerId: string) => {
    if (isTrainerSaved(trainerId)) return;
    
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

  const displayedTrainers = showAllMatches ? trainers : trainers.slice(0, 6);
  const topMatches = trainers.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Finding your perfect matches...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute left-0 top-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quiz
        </Button>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Your Perfect Matches</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Based on your preferences, here are your top trainer matches
        </p>
      </div>

      {/* Quiz Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Goals</p>
              <div className="flex flex-wrap gap-1">
                {session?.quizResults?.goals.map(goal => (
                  <Badge key={goal} variant="secondary" className="text-xs">
                    {goal.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Budget</p>
              <Badge variant="outline">£{session?.quizResults?.budget}/session</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Style</p>
              <div className="flex flex-wrap gap-1">
                {session?.quizResults?.coachingStyle.slice(0, 2).map(style => (
                  <Badge key={style} variant="secondary" className="text-xs">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Location</p>
              <Badge variant="outline">{session?.quizResults?.location}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Matches */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Top 3 Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topMatches.map((trainer, index) => (
            <Card key={trainer.id} className="relative overflow-hidden">
              {index === 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Best Match
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                {/* Match Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className="text-lg font-bold text-primary">
                      {trainer.match_score}%
                    </span>
                  </div>
                  <Progress value={trainer.match_score} className="h-2" />
                </div>

                {/* Trainer Info */}
                <div className="text-center mb-4">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={trainer.profile_photo_url} />
                    <AvatarFallback>
                      {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg">
                    {trainer.first_name} {trainer.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {trainer.tagline}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{trainer.location}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{trainer.rating?.toFixed(1) || 'New'}</span>
                  </div>
                  <div>
                    <span className="font-semibold">£{trainer.hourly_rate}</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    variant={isTrainerSaved(trainer.id) ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleSaveClick(trainer.id)}
                    disabled={isTrainerSaved(trainer.id)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isTrainerSaved(trainer.id) ? 'fill-current' : ''}`} />
                    {isTrainerSaved(trainer.id) ? 'Saved' : 'Save to Shortlist'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessageClick(trainer.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBookClick(trainer.id)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Conversion CTA */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">See All Your Matches</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            We found {trainers.length} trainers that match your preferences. 
            Create a free account to see your complete match list, message trainers, and book sessions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth?signup=true')}
              className="px-8"
            >
              <Users className="h-5 w-5 mr-2" />
              Create Free Account
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowAllMatches(true)}
            >
              Preview More Matches
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Matches (if preview enabled) */}
      {showAllMatches && trainers.length > 3 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">More Great Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.slice(3).map((trainer) => (
              <Card key={trainer.id} className="group hover:shadow-lg transition-shadow opacity-75">
                <CardContent className="p-6">
                  {/* Match Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Match Score</span>
                      <span className="text-lg font-bold text-primary">
                        {trainer.match_score}%
                      </span>
                    </div>
                    <Progress value={trainer.match_score} className="h-2" />
                  </div>

                  {/* Trainer basic info */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={trainer.profile_photo_url} />
                      <AvatarFallback>
                        {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {trainer.first_name} {trainer.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {trainer.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Locked overlay */}
                  <div className="relative">
                    <div className="blur-sm">
                      <div className="flex justify-between items-center text-sm">
                        <span>£{trainer.hourly_rate}/hour</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{trainer.rating?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-xs font-medium text-primary">Create account to unlock</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Prompts */}
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