import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useTrainerEngagement } from "@/hooks/useTrainerEngagement";
import { useConversations } from "@/hooks/useConversations";
import { useRealTrainers } from "@/hooks/useRealTrainers";
import { useAuth } from "@/hooks/useAuth";
import { useDiscoveryCallData } from "@/hooks/useDiscoveryCallData";
import { useWaitlist } from "@/hooks/useWaitlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainerCard } from "@/components/TrainerCard";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { useProfile } from "@/hooks/useProfile";
import { ClientHeader } from "@/components/ClientHeader";
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Phone, 
  MessageCircle, 
  Calendar,
  Filter,
  Users,
  X,
  BarChart3,
  Clock,
  Edit,
  UserCheck
} from "lucide-react";
import { DiscoveryCallBookingModal } from "@/components/discovery-call/DiscoveryCallBookingModal";
import { ClientRescheduleModal } from "@/components/dashboard/ClientRescheduleModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MyTrainers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { trainers: allTrainers } = useRealTrainers();
  const { conversations } = useConversations();
  
  // Hooks for trainer management
  const { savedTrainerIds, unsaveTrainer } = useSavedTrainers();
  const { 
    shortlistTrainer, 
    isShortlisted, 
    shortlistCount, 
    canShortlistMore, 
    removeFromShortlist, 
    bookDiscoveryCall,
    shortlistedTrainers: actualShortlistedTrainers 
  } = useShortlistedTrainers();
  const { createConversation } = useConversations();
  const { getEngagementStage, getLikedTrainers, getOnlyShortlistedTrainers, getDiscoveryStageTrainers, getMatchedTrainers } = useTrainerEngagement();
  const { hasActiveDiscoveryCall, getDiscoveryCallForTrainer } = useDiscoveryCallData();
  const { getCoachAvailability, checkClientWaitlistStatus, joinWaitlist } = useWaitlist();

  // State for filtering and UI
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'shortlisted' | 'discovery'>('all');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [trainerAvailability, setTrainerAvailability] = useState<{[key: string]: any}>({});

  // Listen for filter events from dashboard
  useEffect(() => {
    const handleFilterEvent = (event: CustomEvent) => {
      const { filter } = event.detail;
      setActiveFilter(filter);
    };

    window.addEventListener('setMyTrainersFilter', handleFilterEvent as EventListener);
    
    return () => {
      window.removeEventListener('setMyTrainersFilter', handleFilterEvent as EventListener);
    };
  }, []);

  // Batch fetch availability data for all shortlisted trainers (much more efficient)
  useEffect(() => {
    const fetchAllAvailabilityData = async () => {
      const shortlistedTrainers = getOnlyShortlistedTrainers();
      const trainerIds = shortlistedTrainers.map(engagement => engagement.trainerId);
      
      console.log('🔧 Batch fetching availability for trainers:', trainerIds.length);
      
      // Don't block UI if no shortlisted trainers
      if (trainerIds.length === 0) {
        console.log('📋 No shortlisted trainers to fetch availability for');
        return;
      }
      
      try {
        // Batch fetch all availability settings in one query
        console.log('🔧 Making single batch query for all trainers');
        const { data: availabilityData, error } = await supabase
          .from('coach_availability_settings')
          .select('*')
          .in('coach_id', trainerIds);
        
        if (error) {
          console.warn('⚠️ Failed to batch fetch availability:', error);
          return;
        }
        
        console.log('✅ Successfully fetched availability data:', availabilityData);
        
        // Convert array to object for easy lookup
        const availabilityMap: {[key: string]: any} = {};
        availabilityData?.forEach(item => {
          availabilityMap[item.coach_id] = item;
        });
        
        // Set availability for all trainers (null for ones not found)
        const newAvailability: {[key: string]: any} = {};
        trainerIds.forEach(trainerId => {
          newAvailability[trainerId] = availabilityMap[trainerId] || null;
        });
        
        setTrainerAvailability(newAvailability);
        console.log('🎯 Set availability for trainers:', Object.keys(newAvailability));
        
      } catch (error) {
        console.warn('⚠️ Batch availability fetch failed:', error);
        // Set all to null but don't block the UI
        const fallbackAvailability: {[key: string]: any} = {};
        trainerIds.forEach(trainerId => {
          fallbackAvailability[trainerId] = null;
        });
        setTrainerAvailability(fallbackAvailability);
      }
    };
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Batch availability fetch timeout')), 5000)
    );
    
    Promise.race([fetchAllAvailabilityData(), timeoutPromise])
      .catch(error => {
        console.warn('⚠️ Availability fetch timed out or failed:', error);
      });
  }, [getOnlyShortlistedTrainers]);

  // Simplified trainer aggregation based on client's engagement status
  const trainersWithStatus = useMemo(() => {
    const allTrainerData: Array<{
      trainer: any;
      status: 'saved' | 'shortlisted' | 'discovery';
      engagement?: any;
      statusLabel: string;
      statusColor: string;
    }> = [];

    // Get liked/saved trainers (stage: 'liked')
    const likedTrainers = getLikedTrainers();
    likedTrainers.forEach(engagement => {
      const trainer = allTrainers.find(t => t.id === engagement.trainerId);
      if (trainer) {
        allTrainerData.push({
          trainer,
          status: 'saved',
          engagement,
          statusLabel: 'Saved',
          statusColor: 'bg-blue-100 text-blue-800'
        });
      }
    });

    // Get only shortlisted trainers (stage: 'shortlisted') - not including discovery stage
    const onlyShortlistedTrainers = getOnlyShortlistedTrainers();
    for (const engagement of onlyShortlistedTrainers) {
      let trainer = allTrainers.find(t => t.id === engagement.trainerId);
      
      // If trainer not found in allTrainers, create a placeholder with basic info
      if (!trainer) {
        trainer = {
          id: engagement.trainerId,
          name: 'Loading trainer...',
          specialties: [],
          rating: 0,
          reviews: 0,
          experience: '',
          location: 'Loading...',
          hourlyRate: 0,
          image: '',
          certifications: [],
          description: 'Loading trainer information...',
          availability: 'Unknown',
          trainingType: ['Loading...']
        };
      }
      
      // Check if already exists in the list (upgrade from saved to shortlisted)
      const existingIndex = allTrainerData.findIndex(t => t.trainer.id === engagement.trainerId);
      
      if (existingIndex >= 0) {
        // Upgrade existing trainer to shortlisted status
        allTrainerData[existingIndex] = {
          trainer,
          status: 'shortlisted',
          engagement,
          statusLabel: 'Shortlisted',
          statusColor: 'bg-yellow-100 text-yellow-800'
        };
      } else {
        // Add as new shortlisted trainer
        allTrainerData.push({
          trainer,
          status: 'shortlisted',
          engagement,
          statusLabel: 'Shortlisted',
          statusColor: 'bg-yellow-100 text-yellow-800'
        });
      }
    }

    // Get trainers for discovery section - includes:
    // 1. Trainers with active discovery calls (scheduled/rescheduled, not cancelled)  
    // 2. Trainers with discovery-related engagement stages
    // 3. Shortlisted trainers who have exchanged messages (indicating discovery conversations)
    const trainersWithDiscoveryCalls = new Set<string>();
    
    // First, collect all trainer IDs that have active discovery calls
    allTrainers.forEach(trainer => {
      if (hasActiveDiscoveryCall(trainer.id)) {
        trainersWithDiscoveryCalls.add(trainer.id);
      }
    });
    
    // Also check trainers from already processed engagement data that might have discovery calls
    allTrainerData.forEach(trainerData => {
      if (hasActiveDiscoveryCall(trainerData.trainer.id)) {
        trainersWithDiscoveryCalls.add(trainerData.trainer.id);
      }
    });
    
    // Include trainers with discovery-related engagement stages
    const discoveryStageTrainers = getDiscoveryStageTrainers();
    discoveryStageTrainers.forEach((engagement: any) => {
      if (engagement.stage === 'discovery_in_progress' || 
          engagement.stage === 'discovery_call_booked' || 
          engagement.stage === 'discovery_completed') {
        trainersWithDiscoveryCalls.add(engagement.trainerId);
      }
    });
    
    // ALSO include shortlisted trainers who have active conversations (indicating discovery in progress)
    allTrainerData.forEach(trainerData => {
      if (trainerData.status === 'shortlisted') {
        // Check if this trainer has any messages with the client
        const hasConversation = conversations.some(conv => 
          (conv.client_id === user?.id && conv.trainer_id === trainerData.trainer.id) ||
          (conv.trainer_id === user?.id && conv.client_id === trainerData.trainer.id)
        );
        if (hasConversation) {
          trainersWithDiscoveryCalls.add(trainerData.trainer.id);
        }
      }
    });
    
    // Now add/upgrade all trainers with discovery calls
    trainersWithDiscoveryCalls.forEach(trainerId => {
      let trainer = allTrainers.find(t => t.id === trainerId);
      
      // If trainer not found in allTrainers, create a placeholder with basic info
      if (!trainer) {
        trainer = {
          id: trainerId,
          name: 'Loading trainer...',
          specialties: [],
          rating: 0,
          reviews: 0,
          experience: '',
          location: 'Loading...',
          hourlyRate: 0,
          image: '',
          certifications: [],
          description: 'Loading trainer information...',
          availability: 'Unknown',
          trainingType: ['Loading...']
        };
      }
      
      // Check if already exists in the list
      const existingIndex = allTrainerData.findIndex(t => t.trainer.id === trainerId);
      
      if (existingIndex >= 0) {
        // Don't upgrade if trainer is already matched - keep them in correct status
        if (allTrainerData[existingIndex].status !== 'discovery') {
          allTrainerData[existingIndex] = {
            trainer,
            status: 'discovery',
            engagement: allTrainerData[existingIndex].engagement,
            statusLabel: 'Discovery Active',
            statusColor: 'bg-purple-100 text-purple-800'
          };
        }
      } else {
        // Add as new discovery trainer
        allTrainerData.push({
          trainer,
          status: 'discovery',
          engagement: null,
          statusLabel: 'Discovery Active',
          statusColor: 'bg-purple-100 text-purple-800'
        });
      }
    });

    // Add matched trainers
    const matchedTrainers = getMatchedTrainers();
    matchedTrainers.forEach(engagement => {
      let trainer = allTrainers.find(t => t.id === engagement.trainerId);
      
      if (!trainer) {
        trainer = {
          id: engagement.trainerId,
          name: 'Loading trainer...',
          specialties: [],
          rating: 0,
          reviews: 0,
          experience: '',
          location: 'Loading...',
          hourlyRate: 0,
          image: '',
          certifications: [],
          description: 'Loading trainer information...',
          availability: 'Unknown',
          trainingType: ['Loading...']
        };
      }
      
      // Check if already exists and upgrade to matched status
      const existingIndex = allTrainerData.findIndex(t => t.trainer.id === engagement.trainerId);
      
      if (existingIndex >= 0) {
        allTrainerData[existingIndex] = {
          trainer,
          status: 'discovery', // Keep matched trainers in discovery section
          engagement,
          statusLabel: 'Matched',
          statusColor: 'bg-green-100 text-green-800'
        };
      } else {
        allTrainerData.push({
          trainer,
          status: 'discovery', // Keep matched trainers in discovery section
          engagement,
          statusLabel: 'Matched', 
          statusColor: 'bg-green-100 text-green-800'
        });
      }
    });

    return allTrainerData;
  }, [allTrainers, getLikedTrainers, getOnlyShortlistedTrainers, getDiscoveryStageTrainers, getMatchedTrainers, hasActiveDiscoveryCall, conversations, user]);
  const filteredTrainers = useMemo(() => {
    if (activeFilter === 'all') return trainersWithStatus;
    return trainersWithStatus.filter(t => t.status === activeFilter);
  }, [trainersWithStatus, activeFilter]);

  // Get counts for filter tabs
  const counts = useMemo(() => ({
    all: trainersWithStatus.length,
    saved: trainersWithStatus.filter(t => t.status === 'saved').length,
    shortlisted: trainersWithStatus.filter(t => t.status === 'shortlisted').length,
    discovery: trainersWithStatus.filter(t => t.status === 'discovery').length
  }), [trainersWithStatus]);

  // Handler functions
  const handleSaveTrainer = async (trainerId: string) => {
    console.log('🔥 Save trainer clicked:', trainerId);
    // This would be handled by the TrainerCard's heart button
  };

  const handleUnsaveTrainer = async (trainerId: string) => {
    console.log('🔥 Unsave trainer clicked:', trainerId);
    try {
      const result = await unsaveTrainer(trainerId);
      if (result) {
        toast.success('Trainer removed from saved list!');
      } else {
        toast.error('Failed to remove trainer');
      }
    } catch (error) {
      console.error('Error unsaving trainer:', error);
      toast.error('Failed to remove trainer');
    }
  };

  const handleAddToShortlist = async (trainerId: string) => {
    console.log('🔥 Add to shortlist clicked:', trainerId);
    if (!canShortlistMore) {
      toast.error('You can only shortlist up to 4 trainers');
      return;
    }
    
    try {
      const result = await shortlistTrainer(trainerId);
      if (result.error) {
        toast.error('Failed to add to shortlist');
      } else {
        toast.success('Trainer added to shortlist!');
      }
    } catch (error) {
      console.error('Error shortlisting trainer:', error);
      toast.error('Failed to add to shortlist');
    }
  };

  const handleRemoveFromShortlist = async (trainerId: string) => {
    console.log('🔥 Remove from shortlist clicked:', trainerId);
    try {
      const result = await removeFromShortlist(trainerId);
      if (result.error) {
        toast.error('Failed to remove from shortlist');
      } else {
        toast.success('Trainer removed from shortlist!');
      }
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      toast.error('Failed to remove from shortlist');
    }
  };

  const handleStartConversation = (trainerId: string) => {
    console.log('🔥 Start conversation clicked:', trainerId);
    console.log('🔥 Dispatching openMessagePopup event...');
    // Trigger messaging popup
    const event = new CustomEvent('openMessagePopup', {
      detail: { trainerId }
    });
    window.dispatchEvent(event);
    console.log('🔥 Event dispatched successfully');
  };

  const [selectedTrainerForCall, setSelectedTrainerForCall] = useState<string | null>(null);
  const [selectedCallForReschedule, setSelectedCallForReschedule] = useState<any>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const handleBookDiscoveryCall = async (trainerId: string) => {
    console.log('🔥 Book discovery call clicked:', trainerId);
    setSelectedTrainerForCall(trainerId);
  };

  const handleViewProfile = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  const handleComparisonToggle = (trainerId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : prev.length < 4 
          ? [...prev, trainerId] 
          : prev
    );
  };

  const handleStartComparison = () => {
    // TODO: Implement comparison view
    toast.info('Comparison feature coming soon!');
  };

  const handleJoinWaitlist = async (trainerId: string) => {
    console.log('🔥 Join waitlist clicked:', trainerId);
    console.log('🔥 Current trainerAvailability for trainer:', trainerAvailability[trainerId]);
    try {
      const result = await joinWaitlist(trainerId);
      console.log('🔥 Waitlist join result:', result);
      if (result.error) {
        console.error('🔥 Waitlist join error:', result.error);
        toast.error('Failed to join waitlist');
      } else {
        toast.success('Joined waitlist! The trainer will contact you when available.');
        // Note: No need to update local state since we're using client-side logic
      }
    } catch (error) {
      console.error('🔥 Error joining waitlist:', error);
      toast.error('Failed to join waitlist');
    }
  };

  const handleRescheduleCall = (trainerId: string) => {
    console.log('🔥 Reschedule call clicked:', trainerId);
    const discoveryCall = getDiscoveryCallForTrainer(trainerId);
    if (discoveryCall) {
      setSelectedCallForReschedule(discoveryCall);
      setIsRescheduleModalOpen(true);
    }
  };

  const handleChooseCoach = (trainerId: string) => {
    console.log('🔥 Choose coach clicked:', trainerId);
    toast.info('Choose coach feature coming soon!');
  };

  // Render CTAs based on trainer status
  const renderCTAs = (trainerData: typeof trainersWithStatus[0]) => {
    const { trainer, status } = trainerData;

    switch (status) {
      case 'saved':
        return (
          <div className="space-y-2">
            <Button
              onClick={() => handleAddToShortlist(trainer.id)}
              className="w-full"
              size="sm"
              disabled={!canShortlistMore}
            >
              <Star className="h-3 w-3 mr-1" />
              {canShortlistMore ? 'Add to Shortlist' : `Shortlist Full (${shortlistCount}/4)`}
            </Button>
            <Button
              onClick={() => handleUnsaveTrainer(trainer.id)}
              className="w-full"
              size="sm"
              variant="outline"
            >
              <X className="h-3 w-3 mr-1" />
              Remove from Saved
            </Button>
          </div>
        );

      case 'shortlisted':
        const shortlistedTrainerId = trainer.id;
        const availability = trainerAvailability[shortlistedTrainerId];
        const shortlistedEngagementStage = getEngagementStage(shortlistedTrainerId);
        const hasActiveCall = hasActiveDiscoveryCall(shortlistedTrainerId);
        
        // Determine if should show waitlist button using client-side logic
        const isOnWaitlist = availability?.availability_status === 'waitlist';
        const allowDiscoveryOnWaitlist = availability?.allow_discovery_calls_on_waitlist === true;
        const offersDiscoveryCall = trainer.offers_discovery_call;
        
        // Show waitlist button if:
        // - Trainer is on waitlist AND
        // - Client is shortlisted (current stage) AND  
        // - No discovery call booked yet
        const shouldShowWaitlist = isOnWaitlist && 
                                   shortlistedEngagementStage === 'shortlisted' && 
                                   !hasActiveCall;
        
        // Show discovery call button if:
        // - Trainer offers discovery calls AND
        // - Either not on waitlist OR allows discovery calls on waitlist AND
        // - No discovery call booked yet
        const shouldShowDiscoveryCall = offersDiscoveryCall && 
                                        (!isOnWaitlist || allowDiscoveryOnWaitlist) && 
                                        shortlistedEngagementStage === 'shortlisted' && 
                                        !hasActiveCall;
        
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStartConversation(trainer.id)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>
              
              {shouldShowWaitlist ? (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleJoinWaitlist(trainer.id)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Join Waitlist
                </Button>
              ) : shouldShowDiscoveryCall ? (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleBookDiscoveryCall(trainer.id)}
                  title="Book a discovery call with this trainer"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Book Call
                </Button>
              ) : hasActiveCall ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                  title="Discovery call already scheduled"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Call Booked
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBookDiscoveryCall(trainer.id)}
                  title="Book a discovery call"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Book Call
                </Button>
              )}
            </div>
            <Button
              onClick={() => handleRemoveFromShortlist(trainer.id)}
              className="w-full"
              size="sm"
              variant="outline"
            >
              <X className="h-3 w-3 mr-1" />
              Remove from Shortlist
            </Button>
          </div>
        );

      case 'discovery':
        const discoveryCall = getDiscoveryCallForTrainer(trainer.id);
        const callDate = discoveryCall ? new Date(discoveryCall.scheduled_for) : null;
        const isCallInPast = callDate ? callDate < new Date() : false;
        const engagementStage = getEngagementStage(trainer.id);
        const isDiscoveryInProgress = engagementStage === 'discovery_in_progress';
        
        // Check if trainer has waitlist enabled
        const trainerAvailabilityForCTA = trainerAvailability[trainer.id];
        const hasWaitlistEnabled = trainerAvailabilityForCTA?.availability_status === 'waitlist';
        
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStartConversation(trainer.id)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Message
              </Button>
              
              {/* Show waitlist button if trainer has waitlist and client not on it */}
              {hasWaitlistEnabled ? (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleJoinWaitlist(trainer.id)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Join Waitlist
                </Button>
              ) : isDiscoveryInProgress ? (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleChooseCoach(trainer.id)}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Choose Coach
                </Button>
              ) : discoveryCall && !isCallInPast ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRescheduleCall(trainer.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Reschedule
                </Button>
              ) : isCallInPast ? (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleChooseCoach(trainer.id)}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Choose Coach
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStartConversation(trainer.id)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Start Chat
                </Button>
              )}
            </div>
            
            {/* Bottom button - only show Choose as Coach if no waitlist */}
            {!hasWaitlistEnabled && (isDiscoveryInProgress ? (
              <Button
                onClick={() => navigate(`/trainer/${trainer.id}`)}
                className="w-full"
                size="sm"
                variant="outline"
              >
                <Phone className="h-3 w-3 mr-1" />
                View Full Profile
              </Button>
            ) : isCallInPast ? (
              <Button
                onClick={() => navigate(`/trainer/${trainer.id}`)}
                className="w-full"
                size="sm"
                variant="outline"
              >
                <Phone className="h-3 w-3 mr-1" />
                View Details
              </Button>
            ) : (
              <Button
                onClick={() => handleChooseCoach(trainer.id)}
                className="w-full"
                size="sm"
                variant="default"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Choose as Coach
              </Button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading user data...</div>
      </div>
    );
  }

  console.log('🔍 Current user:', user?.id, user?.email);
  console.log('📊 Counts:', counts);
  console.log('📋 Filtered trainers:', filteredTrainers.length);
  console.log('🗨️ Conversations:', conversations.length);
  console.log('📱 Trainer availability status for Linda:', trainerAvailability['bb19a665-f35f-4828-a62c-90ce437bfb18']);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <Tabs value={activeFilter} onValueChange={(value: any) => setActiveFilter(value)} className="w-full sm:w-auto">
          <TabsList className="grid w-full sm:w-auto grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved ({counts.saved})
            </TabsTrigger>
            <TabsTrigger value="shortlisted" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Shortlisted ({counts.shortlisted})
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Discovery ({counts.discovery})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Comparison Button */}
        {selectedForComparison.length >= 2 && (
          <Button 
            variant="default" 
            size="sm"
            onClick={handleStartComparison}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Compare ({selectedForComparison.length})
          </Button>
        )}
      </div>

      {/* Trainers Grid */}
      {filteredTrainers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainerData) => (
            <div key={`${trainerData.trainer.id}-${trainerData.status}`} className="space-y-3">
              <TrainerCard
                trainer={trainerData.trainer}
                onViewProfile={handleViewProfile}
                cardState={trainerData.status}
                showComparisonCheckbox={true}
                comparisonChecked={selectedForComparison.includes(trainerData.trainer.id)}
                onComparisonToggle={handleComparisonToggle}
                comparisonDisabled={!selectedForComparison.includes(trainerData.trainer.id) && selectedForComparison.length >= 4}
                onStartConversation={handleStartConversation}
                onBookDiscoveryCall={handleBookDiscoveryCall}
                trainerOffersDiscoveryCalls={trainerData.trainer.offers_discovery_call}
              />
              
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={trainerData.statusColor}>
                  {trainerData.statusLabel}
                </Badge>
              </div>

              {/* CTAs based on status */}
              {renderCTAs(trainerData)}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {activeFilter === 'all' 
                ? 'No trainers yet' 
                : `No ${activeFilter} trainers`
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {activeFilter === 'all'
                ? 'Start exploring trainers to build your fitness team'
                : `You haven't ${activeFilter === 'saved' ? 'saved' : activeFilter === 'shortlisted' ? 'shortlisted' : 'booked discovery calls with'} any trainers yet`
              }
            </p>
            <Button onClick={() => navigate('/client/dashboard')}>
              Explore Trainers
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Discovery Call Booking Modal */}
      {selectedTrainerForCall && (
        <DiscoveryCallBookingModal
          isOpen={!!selectedTrainerForCall}
          onClose={() => setSelectedTrainerForCall(null)}
          trainer={{
            id: selectedTrainerForCall,
            name: allTrainers.find(t => t.id === selectedTrainerForCall)?.name || 'Unknown',
            firstName: allTrainers.find(t => t.id === selectedTrainerForCall)?.name?.split(' ')[0],
            lastName: allTrainers.find(t => t.id === selectedTrainerForCall)?.name?.split(' ')[1],
            profilePhotoUrl: allTrainers.find(t => t.id === selectedTrainerForCall)?.image
          }}
          onCallBooked={() => {
            // Refresh engagement data
            window.location.reload();
          }}
        />
      )}

      {/* Client Reschedule Modal */}
      {selectedCallForReschedule && (
        <ClientRescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setSelectedCallForReschedule(null);
          }}
          discoveryCall={selectedCallForReschedule}
          trainer={{
            id: selectedCallForReschedule.trainer_id,
            name: allTrainers.find(t => t.id === selectedCallForReschedule.trainer_id)?.name || 'Unknown',
            firstName: allTrainers.find(t => t.id === selectedCallForReschedule.trainer_id)?.name?.split(' ')[0],
            lastName: allTrainers.find(t => t.id === selectedCallForReschedule.trainer_id)?.name?.split(' ')[1]
          }}
          onCallUpdated={() => {
            // Refresh page to update discovery call data
            window.location.reload();
          }}
        />
      )}

      {/* Floating Message Button */}
      <FloatingMessageButton />
    </div>
  );
}