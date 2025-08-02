import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTrainerMatching } from '@/hooks/useTrainerMatching';
import { SwipeableCard } from '@/components/SwipeableCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, X, RotateCcw, Settings, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Trainer } from '@/components/TrainerCard';

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

export default function Discovery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [currentTrainerIndex, setCurrentTrainerIndex] = useState(0);
  const [likedTrainers, setLikedTrainers] = useState<string[]>([]);
  const [passedTrainers, setPassedTrainers] = useState<string[]>([]);
  const [trainersToShow, setTrainersToShow] = useState(sampleTrainers);

  // Get matched trainers with scores
  const { matchedTrainers } = useTrainerMatching(
    trainersToShow, 
    profile?.quiz_answers as any
  );

  const handleSwipe = useCallback((direction: 'left' | 'right', trainer: Trainer) => {
    if (direction === 'right') {
      setLikedTrainers(prev => [...prev, trainer.id]);
      toast({
        title: "❤️ Liked!",
        description: `You liked ${trainer.name}. They've been added to your matches!`,
      });
    } else {
      setPassedTrainers(prev => [...prev, trainer.id]);
    }

    // Move to next trainer
    setCurrentTrainerIndex(prev => prev + 1);
  }, []);

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

        <Button variant="ghost" onClick={() => navigate('/onboarding')}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Card Stack */}
        <div className="relative h-[600px] mb-6">
          {!isFinished ? (
            remainingTrainers.map((match, index) => (
              <SwipeableCard
                key={`${match.trainer.id}-${currentTrainerIndex + index}`}
                trainer={match.trainer}
                onSwipe={handleSwipe}
                matchScore={match.score}
                matchReasons={match.matchReasons}
                index={index}
              />
            ))
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <h2 className="text-2xl font-bold">All Done!</h2>
                <p className="text-muted-foreground">
                  You've seen all available trainers. Check your matches or adjust your preferences.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => navigate('/')} className="w-full">
                    View Matches ({likedTrainers.length})
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/onboarding')} className="w-full">
                    Update Preferences
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
                className="rounded-full w-12 h-12 p-0 border-gray-200 hover:bg-gray-50"
                onClick={handleUndo}
                disabled={currentTrainerIndex === 0}
              >
                <RotateCcw className="h-4 w-4 text-gray-500" />
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
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}