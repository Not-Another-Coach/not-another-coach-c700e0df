import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useEnhancedTrainerMatching } from '@/hooks/useEnhancedTrainerMatching';
import { useRealTrainers } from '@/hooks/useRealTrainers';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { SwipeableInstagramCard } from '@/components/SwipeableInstagramCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, X, RotateCcw, Settings, MessageCircle } from 'lucide-react';
import { ProgressBreadcrumb } from '@/components/ProgressBreadcrumb';
import { toast } from '@/hooks/use-toast';
import { Trainer } from '@/components/TrainerCard';


export default function Discovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useClientProfile();
  const { trainers: realTrainers, loading: trainersLoading } = useRealTrainers();
  const { saveTrainer } = useSavedTrainers();
  const { updateProgress, advanceToStage } = useJourneyProgress();
  const { progress: journeyProgress } = useJourneyProgress();
  const [currentTrainerIndex, setCurrentTrainerIndex] = useState(0);
  const [likedTrainers, setLikedTrainers] = useState<string[]>([]);
  const [passedTrainers, setPassedTrainers] = useState<string[]>([]);
  const [trainersToShow, setTrainersToShow] = useState<Trainer[]>([]);

  // Get matched trainers with enhanced algorithm using client survey data
  const clientSurveyData = profile ? {
    primary_goals: profile.primary_goals,
    secondary_goals: profile.secondary_goals,
    training_location_preference: profile.training_location_preference as "hybrid" | "in-person" | "online" || "hybrid",
    open_to_virtual_coaching: profile.open_to_virtual_coaching,
    preferred_training_frequency: profile.preferred_training_frequency ? parseInt(profile.preferred_training_frequency) || null : null,
    preferred_time_slots: profile.preferred_time_slots,
    start_timeline: profile.start_timeline as "urgent" | "next_month" | "flexible" || "flexible",
    preferred_coaching_style: profile.preferred_coaching_style,
    motivation_factors: profile.motivation_factors,
    client_personality_type: profile.client_personality_type,
    experience_level: profile.experience_level as "beginner" | "intermediate" | "advanced" || "beginner",
    preferred_package_type: profile.preferred_package_type as "ongoing" | "short_term" | "single_session" || "ongoing",
    budget_range_min: profile.budget_range_min,
    budget_range_max: profile.budget_range_max,
    budget_flexibility: profile.budget_flexibility as "flexible" | "strict" | "negotiable" || "flexible",
    waitlist_preference: (profile.waitlist_preference ? "asap" : "quality_over_speed") as "asap" | "quality_over_speed",
    flexible_scheduling: profile.flexible_scheduling,
  } : undefined;

  const { matchedTrainers, topMatches, goodMatches } = useEnhancedTrainerMatching(
    realTrainers, 
    profile?.quiz_answers,
    clientSurveyData
  );

  // Update trainersToShow when real trainers are loaded
  useEffect(() => {
    if (!trainersLoading && realTrainers.length > 0) {
      setTrainersToShow(realTrainers);
    }
  }, [realTrainers, trainersLoading]);

  const handleSwipe = useCallback((direction: 'left' | 'right', trainer: Trainer) => {
    if (direction === 'right') {
      setLikedTrainers(prev => [...prev, trainer.id]);
      // Actually save the trainer using the saved trainers hook
      const saveTrainerToDb = async () => {
        const success = await saveTrainer(trainer.id);
        if (success) {
          toast({
            title: "❤️ Liked!",
            description: `You liked ${trainer.name}. They've been added to your matches!`,
          });
        }
      };
      saveTrainerToDb();
      updateProgress('discovery', 'like_trainer', { trainerId: trainer.id });
    } else {
      setPassedTrainers(prev => [...prev, trainer.id]);
      updateProgress('discovery', 'pass_trainer', { trainerId: trainer.id });
    }

    // Move to next trainer
    setCurrentTrainerIndex(prev => prev + 1);
  }, [saveTrainer, updateProgress]);

  const handleLike = () => {
    if (currentTrainerIndex < matchedTrainers.length) {
      handleSwipe('right', matchedTrainers[currentTrainerIndex].trainer);
    }
  };

  const handlePass = () => {
    if (currentTrainerIndex < matchedTrainers.length) {
      handleSwipe('left', matchedTrainers[currentTrainerIndex].trainer);
    }
  };

  const handleUndo = () => {
    if (currentTrainerIndex > 0) {
      const prevTrainer = matchedTrainers[currentTrainerIndex - 1];
      setCurrentTrainerIndex(prev => prev - 1);
      setLikedTrainers(prev => prev.filter(id => id !== prevTrainer.trainer.id));
      setPassedTrainers(prev => prev.filter(id => id !== prevTrainer.trainer.id));
      
      toast({
        title: "Undone",
        description: "Your last action has been undone.",
      });
    }
  };

  const remainingTrainers = matchedTrainers.slice(currentTrainerIndex, currentTrainerIndex + 3);
  const isFinished = currentTrainerIndex >= matchedTrainers.length;

  // Show loading state while trainers are being fetched
  if (trainersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Finding Your Perfect Trainers</h2>
            <p className="text-muted-foreground">
              We're loading personalized trainer recommendations just for you...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no trainers found
  if (!trainersLoading && realTrainers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">No Trainers Available</h2>
            <p className="text-muted-foreground mb-4">
              We're currently adding new trainers to the platform. Check back soon!
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center">
          <h1 className="font-bold text-lg">Discover Trainers</h1>
          <p className="text-sm text-muted-foreground">
            {currentTrainerIndex} of {matchedTrainers.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/client-survey')}
            className="flex items-center gap-2 hover:bg-primary/10"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Survey</span>
          </Button>
        </div>
      </div>

      {/* Progress Breadcrumb */}
      {journeyProgress && (
        <div className="max-w-md mx-auto px-4 mb-4">
          <ProgressBreadcrumb 
            progress={journeyProgress} 
            variant="minimal"
          />
        </div>
      )}

      <div className="max-w-md mx-auto p-4">
        {/* Card Stack */}
        <div className="relative h-[600px] mb-6">
          {!isFinished ? (
            remainingTrainers.map((match, index) => (
              <SwipeableInstagramCard
                key={`${match.trainer.id}-${currentTrainerIndex + index}`}
                trainer={match.trainer}
                onSwipe={handleSwipe}
                matchScore={match.compatibilityPercentage}
                matchReasons={match.matchReasons}
                index={index}
              />
            ))
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <h2 className="text-2xl font-bold">All Done!</h2>
                <p className="text-muted-foreground mb-4">
                  No more matches right now! New trainers join daily — check back soon for more options.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => navigate('/')} className="w-full">
                    View Your Matches ({likedTrainers.length})
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/client-survey')} className="w-full">
                    Update Your Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {!isFinished && (
          <>
            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 p-0 border-red-200 hover:bg-red-50"
                onClick={handlePass}
                disabled={isFinished}
              >
                <X className="h-6 w-6 text-red-500" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12 p-0 border-gray-200 hover:bg-gray-50 group"
                onClick={handleUndo}
                disabled={currentTrainerIndex === 0}
                title="Undo last action"
              >
                <RotateCcw className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                <span className="sr-only">Undo</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 p-0 border-green-200 hover:bg-green-50"
                onClick={handleLike}
                disabled={isFinished}
              >
                <Heart className="h-6 w-6 text-green-500" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{likedTrainers.length}</div>
                <div className="text-xs text-muted-foreground">Liked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{passedTrainers.length}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{matchedTrainers.length - currentTrainerIndex}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </>
        )}

        {/* Tips */}
        {!isFinished && currentTrainerIndex < 3 && (
          <Card className="mt-6 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">💡 Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Swipe right or tap ❤️ to like</li>
                <li>• Swipe left or tap ✕ to pass</li>
                <li>• Tap ↻ to undo your last action</li>
                <li>• Check match scores for recommendations</li>
                <li>• Tap "Edit Survey" above to change your preferences</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}