import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainerCard } from "@/components/TrainerCard";
import { Heart, X, Shuffle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - in real app this would come from swipe history API
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

const mockLikedTrainers = [
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
  }
];

const mockUnlikedTrainers = [
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
  }
];

interface SwipeResultsSectionProps {
  profile: any;
}

export function SwipeResultsSection({ profile }: SwipeResultsSectionProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("liked");

  const handleViewProfile = (trainerId: string) => {
    console.log("View profile:", trainerId);
    // This would navigate to trainer detail page
  };

  const handleReLike = (trainerId: string) => {
    // Add trainer back to liked list
    console.log("Re-liked trainer:", trainerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Swipe History</h1>
          <p className="text-muted-foreground">
            Review your liked and passed trainers from discovery sessions
          </p>
        </div>
        <Button onClick={() => navigate('/discovery')}>
          <Shuffle className="h-4 w-4 mr-2" />
          Continue Swiping
        </Button>
      </div>

      {/* Tabs for liked/unliked */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Liked ({mockLikedTrainers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="unliked" className="flex items-center gap-2">
            <X className="h-4 w-4" />
            <span>Passed ({mockUnlikedTrainers.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Liked Trainers */}
        <TabsContent value="liked" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Trainers You Liked</h2>
            <Badge variant="outline">{mockLikedTrainers.length} trainers</Badge>
          </div>
          
          {mockLikedTrainers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLikedTrainers.map((trainer) => (
                <div key={trainer.id} className="relative">
                  <TrainerCard
                    trainer={trainer}
                    onViewProfile={handleViewProfile}
                  />
                  <Badge 
                    className="absolute top-2 right-2 bg-green-500 text-white"
                  >
                    ❤️ Liked
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No liked trainers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start swiping to like trainers and build your matches
                </p>
                <Button onClick={() => navigate('/discovery')}>
                  Start Swiping
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Passed/Unliked Trainers */}
        <TabsContent value="unliked" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Trainers You Passed</h2>
            <Badge variant="outline">{mockUnlikedTrainers.length} trainers</Badge>
          </div>
          
          {mockUnlikedTrainers.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Changed your mind? You can give these trainers another chance.
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockUnlikedTrainers.map((trainer) => (
                  <div key={trainer.id} className="relative">
                    <TrainerCard
                      trainer={trainer}
                      onViewProfile={handleViewProfile}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="secondary">
                        Passed
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <Button
                        size="sm"
                        onClick={() => handleReLike(trainer.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <X className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No passed trainers</h3>
                <p className="text-muted-foreground mb-4">
                  Trainers you pass on will appear here for a second chance
                </p>
                <Button onClick={() => navigate('/discovery')}>
                  Start Swiping
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}