import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainerCard } from "@/components/TrainerCard";
import { Heart, X, Shuffle, Users, Phone, MessageCircle, Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useDiscoveryCallFeedback } from "@/hooks/useDiscoveryCallFeedback";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DiscoveryCallFeedbackModal } from "@/components/discovery-call/DiscoveryCallFeedbackModal";

// Mock data - in real app this would come from swipe history API
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

const mockLikedTrainers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
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
    id: "550e8400-e29b-41d4-a716-446655440003",
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
    id: "550e8400-e29b-41d4-a716-446655440002", 
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
  const { user } = useAuth();
  const { toast } = useToast();
  const { shortlistedTrainers, loading, removeFromShortlist, refetchShortlisted } = useShortlistedTrainers();
  const { submitFeedback, getFeedback } = useDiscoveryCallFeedback();
  
  const [activeTab, setActiveTab] = useState("shortlisted");
  const [completedDiscoveryCalls, setCompletedDiscoveryCalls] = useState([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: string]: boolean}>({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  // Load completed discovery calls
  useEffect(() => {
    const loadCompletedCalls = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('discovery_calls')
        .select(`
          id,
          trainer_id,
          scheduled_for,
          status,
          profiles!discovery_calls_trainer_id_fkey(first_name, last_name)
        `)
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .order('scheduled_for', { ascending: false });

      if (data && !error) {
        setCompletedDiscoveryCalls(data);
        
        // Check feedback status for each completed call
        const feedbackStatus = {};
        for (const call of data) {
          const { data: feedback } = await getFeedback(call.id);
          feedbackStatus[call.trainer_id] = !!feedback;
        }
        setFeedbackSubmitted(feedbackStatus);
      }
    };

    loadCompletedCalls();
  }, [user, getFeedback]);

  // Filter shortlisted trainers into those with and without completed discovery calls
  const shortlistedOnly = shortlistedTrainers.filter(trainer => 
    !completedDiscoveryCalls.some(call => call.trainer_id === trainer.trainer_id)
  );
  
  const discoveryCompleted = completedDiscoveryCalls.map(call => {
    const shortlistedTrainer = shortlistedTrainers.find(t => t.trainer_id === call.trainer_id);
    return {
      ...call,
      shortlistedData: shortlistedTrainer,
      hasFeedback: feedbackSubmitted[call.trainer_id] || false
    };
  });

  const handleChooseCoach = async (trainerId: string) => {
    // TODO: Implement coach selection logic
    toast({
      title: "Feature Coming Soon",
      description: "Coach selection and onboarding process will be available soon.",
    });
  };

  const handleMoveBackToShortlist = async (trainerId: string) => {
    // This would reset the discovery call status for the trainer
    toast({
      title: "Feature Coming Soon", 
      description: "Moving trainers back to shortlist will be available soon.",
    });
  };

  const handleViewProfile = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  const handleReLike = (trainerId: string) => {
    // Add trainer back to liked list
    console.log("Re-liked trainer:", trainerId);
  };

  const handleOpenFeedbackModal = (call: any) => {
    setSelectedCall({
      id: call.id,
      trainer_id: call.trainer_id,
      trainer_name: `${call.profiles?.first_name || 'Trainer'} ${call.profiles?.last_name || call.trainer_id}`,
      scheduled_for: call.scheduled_for,
    });
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmitted = () => {
    if (selectedCall) {
      setFeedbackSubmitted(prev => ({ ...prev, [selectedCall.trainer_id]: true }));
    }
    // Refresh data
    if (user) {
      const loadCompletedCalls = async () => {
        const { data, error } = await supabase
          .from('discovery_calls')
          .select(`
            id,
            trainer_id,
            scheduled_for,
            status,
            profiles!discovery_calls_trainer_id_fkey(first_name, last_name)
          `)
          .eq('client_id', user.id)
          .eq('status', 'completed')
          .order('scheduled_for', { ascending: false });

        if (data && !error) {
          setCompletedDiscoveryCalls(data);
          
          // Check feedback status for each completed call
          const feedbackStatus = {};
          for (const call of data) {
            const { data: feedback } = await getFeedback(call.id);
            feedbackStatus[call.trainer_id] = !!feedback;
          }
          setFeedbackSubmitted(feedbackStatus);
        }
      };
      loadCompletedCalls();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Trainers</h1>
          <p className="text-muted-foreground">
            Manage your shortlisted trainers and those you've spoken with
          </p>
        </div>
        <Button onClick={() => navigate('/discovery')}>
          <Shuffle className="h-4 w-4 mr-2" />
          Discover More
        </Button>
      </div>

      {/* Tabs for shortlisted/discovery completed */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${discoveryCompleted.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="shortlisted" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Shortlisted ({shortlistedOnly.length})</span>
          </TabsTrigger>
          {discoveryCompleted.length > 0 && (
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Discovery Calls ({discoveryCompleted.length})</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Shortlisted Trainers */}
        <TabsContent value="shortlisted" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shortlisted Trainers</h2>
            <Badge variant="outline">{shortlistedOnly.length} trainers</Badge>
          </div>
          
          {shortlistedOnly.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {shortlistedOnly.map((trainer) => (
                <Card key={trainer.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Trainer #{trainer.trainer_id}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Shortlisted {new Date(trainer.shortlisted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeFromShortlist(trainer.trainer_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Chat Enabled
                        </Badge>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Discovery Call Available
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                        <Button variant="default" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Book Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shortlisted trainers</h3>
                <p className="text-muted-foreground mb-4">
                  Discover and shortlist trainers to unlock chat and discovery call features
                </p>
                <Button onClick={() => navigate('/discovery')}>
                  Discover Trainers
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Discovery Calls Completed */}
        {discoveryCompleted.length > 0 && (
          <TabsContent value="discovery" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Discovery Calls Completed</h2>
              <Badge variant="outline">{discoveryCompleted.length} trainers</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {discoveryCompleted.map((call) => (
                <Card key={call.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {call.profiles?.first_name} {call.profiles?.last_name}
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Call Complete
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Discovery call on {new Date(call.scheduled_for).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Feedback Status */}
                      {call.hasFeedback ? (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Feedback submitted</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <div className="text-amber-800 text-sm">
                            Please submit feedback before choosing this coach
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMoveBackToShortlist(call.trainer_id)}
                        >
                          Move to Shortlist
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          disabled={!call.hasFeedback}
                          onClick={() => handleChooseCoach(call.trainer_id)}
                          className={call.hasFeedback ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Choose Coach
                        </Button>
                      </div>

                      {!call.hasFeedback && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleOpenFeedbackModal(call)}
                        >
                          Submit Feedback
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

      </Tabs>

      {/* Feedback Modal */}
      {selectedCall && (
        <DiscoveryCallFeedbackModal
          open={feedbackModalOpen}
          onOpenChange={setFeedbackModalOpen}
          discoveryCall={selectedCall}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
}