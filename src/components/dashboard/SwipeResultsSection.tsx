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

  // Load discovery calls (both scheduled and completed)
  useEffect(() => {
    const loadDiscoveryCalls = async () => {
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
        .in('status', ['scheduled', 'completed'])
        .order('scheduled_for', { ascending: false });

      if (data && !error) {
        setCompletedDiscoveryCalls(data);
        
        // Check feedback status for completed calls only
        const feedbackStatus = {};
        for (const call of data) {
          if (call.status === 'completed') {
            const { data: feedback } = await getFeedback(call.id);
            feedbackStatus[call.trainer_id] = !!feedback;
          } else {
            feedbackStatus[call.trainer_id] = false;
          }
        }
        setFeedbackSubmitted(feedbackStatus);
      }
    };

    loadDiscoveryCalls();
  }, [user, getFeedback]);

  console.log('shortlistedTrainers:', shortlistedTrainers);
  console.log('completedDiscoveryCalls:', completedDiscoveryCalls);

  // Filter shortlisted trainers: those with 'shortlisted' stage go to shortlisted tab
  const shortlistedOnly = shortlistedTrainers.filter(trainer => {
    // Get the engagement stage from trainer data
    const stage = trainer.stage || 'shortlisted'; // fallback for backward compatibility
    console.log(`SHORTLIST FILTER - Trainer ${trainer.trainer_id}: stage = ${stage}`);
    return stage === 'shortlisted';
  });
  
  // Trainers with discovery_call_booked stage go to discovery tab
  const discoveryBookedOrCompleted = shortlistedTrainers.filter(trainer => {
    const stage = trainer.stage || 'shortlisted'; // fallback for backward compatibility
    console.log(`DISCOVERY FILTER - Trainer ${trainer.trainer_id}: stage = ${stage}`);
    return stage === 'discovery_call_booked' || stage === 'discovery_completed';
  }).map(trainer => {
    const discoveryCall = completedDiscoveryCalls.find(call => call.trainer_id === trainer.trainer_id);
    return {
      ...trainer,
      discoveryCall,
      hasFeedback: discoveryCall ? (feedbackSubmitted[trainer.trainer_id] || false) : false,
      callStatus: discoveryCall ? discoveryCall.status : 'scheduled'
    };
  });
  
  console.log('Shortlisted only count:', shortlistedOnly.length);
  console.log('Discovery booked/completed count:', discoveryBookedOrCompleted.length);

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

  // If no shortlisted trainers at all, show discovery prompt
  if (shortlistedTrainers.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs for shortlisted/discovery completed */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${discoveryBookedOrCompleted.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="shortlisted" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Shortlisted ({shortlistedOnly.length})</span>
          </TabsTrigger>
          {discoveryBookedOrCompleted.length > 0 && (
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Discovery Calls ({discoveryBookedOrCompleted.length})</span>
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

        {/* Discovery Calls */}
        {discoveryBookedOrCompleted.length > 0 && (
          <TabsContent value="discovery" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Discovery Calls</h2>
            <Badge variant="outline">{discoveryBookedOrCompleted.length} trainers</Badge>
          </div>
            
          <div className="grid md:grid-cols-2 gap-6">
            {discoveryBookedOrCompleted.map((trainer) => (
              <Card key={trainer.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        Trainer #{trainer.trainer_id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {trainer.discoveryCall ? 
                          `Discovery call on ${new Date(trainer.discoveryCall.scheduled_for).toLocaleDateString()}` :
                          `Discovery call booked on ${new Date(trainer.discovery_call_booked_at).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {trainer.callStatus === 'completed' ? 'Call Complete' : 'Call Scheduled'}
                      </Badge>
                      {trainer.hasFeedback && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Feedback Submitted
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMoveBackToShortlist(trainer.trainer_id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Move Back
                      </Button>
                      {trainer.callStatus === 'completed' ? (
                        trainer.hasFeedback ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleChooseCoach(trainer.trainer_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Choose Coach
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenFeedbackModal(trainer.discoveryCall)}
                          >
                            Submit Feedback
                          </Button>
                        )
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProfile(trainer.trainer_id)}
                        >
                          View Profile
                        </Button>
                      )}
                    </div>
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