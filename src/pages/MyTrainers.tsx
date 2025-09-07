import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComparisonView } from "@/components/ComparisonView";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useTrainerEngagement } from "@/hooks/useTrainerEngagement";
import { useConversations } from "@/hooks/useConversations";
import { useMyTrainers } from "@/hooks/useMyTrainers";
import { useAuth } from "@/hooks/useAuth";
import { useDiscoveryCallData } from "@/hooks/useDiscoveryCallData";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useDataSynchronization } from "@/hooks/useDataSynchronization";
import { useProfileByType } from "@/hooks/useProfileByType";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedTrainerCard } from "@/components/trainer-cards/EnhancedTrainerCard";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { WaitlistJoinButton } from "@/components/waitlist/WaitlistJoinButton";
import { ClientHeader } from "@/components/ClientHeader";
import { DataSyncIndicator } from "@/components/ui/data-sync-indicator";
import { SkeletonTrainerCard } from "@/components/ui/skeleton-trainer-card";
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
  RefreshCw
} from "lucide-react";
import { DiscoveryCallBookingModal } from "@/components/discovery-call/DiscoveryCallBookingModal";
import { ClientRescheduleModal } from "@/components/dashboard/ClientRescheduleModal";
import { ChooseCoachButton } from "@/components/coach-selection/ChooseCoachButton";
import { BookDiscoveryCallButton } from "@/components/discovery-call/BookDiscoveryCallButton";
import { StartConversationButton } from "@/components/StartConversationButton";

import { toast } from "sonner";

export default function MyTrainers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfileByType();
  
  // Data synchronization hook
  const { 
    loadingState, 
    markTrainersLoaded, 
    markEngagementLoaded, 
    refreshData, 
    refreshTrigger,
    isDataReady,
    isLoading,
    isRefreshing
  } = useDataSynchronization();
  
  // Simplified data fetching with new hook
  const { 
    trainers: allTrainers,
    loading: trainersLoading,
    availability: trainerAvailability,
    filteredTrainers: getFilteredTrainers,
    counts
  } = useMyTrainers(refreshTrigger);
  
  const { conversations } = useConversations();
  
  // Hooks for trainer management actions
  const { savedTrainerIds, unsaveTrainer } = useSavedTrainers();
  const { 
    shortlistTrainer, 
    isShortlisted, 
    shortlistCount, 
    canShortlistMore, 
    removeFromShortlist, 
    bookDiscoveryCall
  } = useShortlistedTrainers(refreshTrigger);
  const { createConversation } = useConversations();
  const { 
    getEngagementStage,
    updateEngagementStage,
    likeTrainer,
    loading: engagementLoading
  } = useTrainerEngagement(refreshTrigger);
  const { hasActiveDiscoveryCall, getDiscoveryCallForTrainer } = useDiscoveryCallData();
  const { getCoachAvailability, checkClientWaitlistStatus, joinWaitlist, removeFromWaitlist } = useWaitlist();

  // State for filtering and UI
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'shortlisted' | 'discovery' | 'declined' | 'waitlist'>('all');
  const [waitlistRefreshKey, setWaitlistRefreshKey] = useState(0);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Notify sync hook when data is loaded
  useEffect(() => {
    if (!trainersLoading && allTrainers.length >= 0) {
      markTrainersLoaded();
    }
  }, [trainersLoading, allTrainers, markTrainersLoaded]);

  useEffect(() => {
    if (!engagementLoading) {
      markEngagementLoaded();
    }
  }, [engagementLoading, markEngagementLoaded]);

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

  // Get filtered trainers based on active filter
  const filteredTrainers = useMemo(() => {
    try {
      console.log('🔍 Filtering trainers with filter:', activeFilter);
      console.log('🔍 All trainers before filtering:', allTrainers);
      const result = getFilteredTrainers(activeFilter);
      console.log('🔍 Filtered result:', result);
      return result;
    } catch (error) {
      console.error('🚨 Error in filteredTrainers useMemo:', error);
      return [];
    }
  }, [getFilteredTrainers, activeFilter]);

  // Enhanced debug logging with manual refresh button
  useEffect(() => {
    console.log('🔍 Current user:', user?.id, user?.email);
    console.log('📊 Counts:', counts);
    console.log('📋 Filtered trainers:', filteredTrainers.length);
    console.log('🗨️ Conversations:', conversations.length);
    console.log('🎯 Data ready state:', isDataReady);
    console.log('⏳ Loading state:', { trainersLoading, engagementLoading, isLoading });
    console.log('🔄 MyTrainers render state:', {
      user: !!user,
      profile: !!profile,
      filteredTrainers: filteredTrainers.length,
      isDataReady,
      showComparison,
      allTrainers: allTrainers.length,
      counts,
      activeFilter,
      engagementLoading,
      trainersLoading
    });
  }, [counts, filteredTrainers.length, conversations.length, user, isDataReady, trainersLoading, engagementLoading, isLoading, profile, allTrainers.length, activeFilter, showComparison]);

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
    // Use the same booking logic as shortlisted trainers to ensure engagement stage is updated
    const result = await bookDiscoveryCall(trainerId);
    if (!result.error) {
      setSelectedTrainerForCall(trainerId);
    }
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
    if (selectedForComparison.length >= 2) {
      setShowComparison(true);
    }
  };

  const getSelectedTrainersData = () => {
    return allTrainers.filter(trainer => selectedForComparison.includes(trainer.id));
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
    // This will now be handled by the ChooseCoachButton component
  };

  const handleMoveToSaved = async (trainerId: string) => {
    console.log('🔥 Move to saved clicked:', trainerId);
    try {
      await likeTrainer(trainerId);
      toast.success('Trainer moved to saved list!');
    } catch (error) {
      console.error('Error moving trainer to saved:', error);
      toast.error('Failed to move trainer to saved');
    }
  };

  const handleLeaveWaitlist = async (trainerId: string) => {
    console.log('🔥 Leave waitlist clicked:', trainerId);
    try {
      const result = await removeFromWaitlist(trainerId);
      if (result.error) {
        toast.error('Failed to leave waitlist');
      } else {
        // Move trainer back to shortlisted if they were shortlisted before
        const currentStage = getEngagementStage(trainerId);
        if (currentStage === 'shortlisted' || currentStage === 'liked') {
          // Keep their current engagement stage
          toast.success('Left waitlist! Trainer moved back to your list.');
        } else {
          // Reset to browsing if no prior engagement
          await updateEngagementStage(trainerId, 'browsing');
          toast.success('Left waitlist!');
        }
        
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error leaving waitlist:', error);
      toast.error('Failed to leave waitlist');
    }
  };

  const handleRemoveCompletely = async (trainerId: string) => {
    console.log('🔥 Remove completely clicked:', trainerId);
    try {
      // Check current engagement stage
      const currentStage = getEngagementStage(trainerId);
      
      if (currentStage === 'declined') {
        // For declined trainers, move to declined_dismissed to preserve history
        await updateEngagementStage(trainerId, 'declined_dismissed');
        toast.success('Trainer removed! They will appear as "Previously Declined" in Explore Coaches.');
      } else {
        // For other stages, reset to browsing
        await updateEngagementStage(trainerId, 'browsing');
        toast.success('Trainer removed completely!');
      }
      
      // Also remove from waitlist if they're on one
      await removeFromWaitlist(trainerId);
    } catch (error) {
      console.error('Error removing trainer completely:', error);
      toast.error('Failed to remove trainer');
    }
  };

  // Render CTAs based on trainer status
  const renderCTAs = (trainer: any) => {
    const { status } = trainer;

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
        
        // Debug logging for Lou specifically
        if (trainer.name.includes('Lou')) {
          console.log(`🐛 DEBUG Lou Discovery Call Logic:`, {
            trainerId: shortlistedTrainerId,
            trainerName: trainer.name,
            trainerObject: trainer,
            availability,
            offersDiscoveryCall,
            isOnWaitlist,
            allowDiscoveryOnWaitlist,
            shortlistedEngagementStage,
            hasActiveCall
          });
        }
        
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
        // - No discovery call booked yet AND
        // - If no availability data exists, default to allowing discovery calls
        const shouldShowDiscoveryCall = offersDiscoveryCall && 
                                        (!availability || !isOnWaitlist || allowDiscoveryOnWaitlist) && 
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
                  onClick={() => handleRescheduleCall(trainer.id)}
                  title="Reschedule your discovery call"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Reschedule Call
                </Button>
              ) : offersDiscoveryCall ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled
                  className="opacity-75 cursor-not-allowed"
                  title="No discovery call slots available"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  No Call Available
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled
                  className="opacity-75 cursor-not-allowed"
                  title="This trainer doesn't offer discovery calls"
                >
                  <X className="h-3 w-3 mr-1" />
                  No Call Available
                </Button>
               )}
             </div>
             
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
         
         console.log(`🔥 Discovery CTA Debug for ${trainer.name}:`);
         console.log(`🔥 - Trainer ID: ${trainer.id}`);
         console.log(`🔥 - Trainer availability data:`, trainerAvailabilityForCTA);
         console.log(`🔥 - Has waitlist enabled: ${hasWaitlistEnabled}`);
         console.log(`🔥 - Discovery call exists: ${!!discoveryCall}`);
         console.log(`🔥 - Call in past: ${isCallInPast}`);
         console.log(`🔥 - Is discovery in progress: ${isDiscoveryInProgress}`);
         
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
                 <WaitlistJoinButton
                   coachId={trainer.id}
                   coachName={trainer.name}
                   nextAvailableDate={null}
                   waitlistMessage={trainerAvailabilityForCTA?.waitlist_message}
                   onWaitlistChange={() => setWaitlistRefreshKey(prev => prev + 1)}
                 />
               ) : discoveryCall && !isCallInPast ? (
                 <Button 
                   size="sm" 
                   variant="outline"
                   onClick={() => handleRescheduleCall(trainer.id)}
                 >
                   <Edit className="h-3 w-3 mr-1" />
                   Reschedule Call
                 </Button>
               ) : (isDiscoveryInProgress || (discoveryCall && isCallInPast) || getEngagementStage(trainer.id) === 'getting_to_know_your_coach') ? (
                 <ChooseCoachButton
                   trainer={trainer}
                   stage={getEngagementStage(trainer.id) === 'matched' ? 'agreed' : getEngagementStage(trainer.id) as any}
                   className="w-full"
                 />
               ) : trainer.offers_discovery_call ? (
                 <Button 
                   size="sm" 
                   variant="outline"
                   disabled
                   className="opacity-75 cursor-not-allowed"
                 >
                   <Calendar className="h-3 w-3 mr-1" />
                   No Call Available
                 </Button>
               ) : (
                 <Button 
                   size="sm" 
                   variant="outline"
                   disabled
                   className="opacity-75 cursor-not-allowed"
                 >
                   <X className="h-3 w-3 mr-1" />
                   No Call Available
                 </Button>
               )}
              </div>
            </div>
          );

      case 'declined':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleMoveToSaved(trainer.id)}
                title="Move trainer back to saved list"
              >
                <Heart className="h-3 w-3 mr-1" />
                Re-save
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleRemoveCompletely(trainer.id)}
                className="text-red-600 hover:text-red-700"
                title="Remove trainer completely"
              >
                <X className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
         );

        case 'waitlist':
          const offersDiscoveryCallWaitlist = trainer.offers_discovery_call;
          const trainerName = trainer.name;
          const waitlistEngagementStage = getEngagementStage(trainer.id);
          const hasExclusiveAccess = trainer.hasExclusiveAccess;
          
          return (
            <div className="space-y-2">
              {/* Choose Coach Button - Show only during exclusive access periods */}
              {hasExclusiveAccess && (
                <ChooseCoachButton
                  trainer={{
                    id: trainer.id,
                    name: trainerName,
                    firstName: trainerName?.split(' ')[0],
                    lastName: trainerName?.split(' ')[1],
                    profilePhotoUrl: trainer.image,
                    package_options: trainer.package_options
                  }}
                  stage="discovery_in_progress" // Use discovery_in_progress stage to allow Choose Coach functionality
                  className="w-full"
                />
              )}
              
              <div className="grid grid-cols-2 gap-2">
                {/* Show Book Discovery Call button only if trainer offers discovery calls AND user has exclusive access */}
                {offersDiscoveryCallWaitlist && hasExclusiveAccess ? (
                  <BookDiscoveryCallButton 
                    trainer={{ 
                      id: trainer.id,
                      name: trainerName,
                      firstName: trainerName?.split(' ')[0],
                      lastName: trainerName?.split(' ')[1],
                      profilePhotoUrl: trainer.image,
                      offers_discovery_call: true
                    }}
                    size="sm"
                    className="flex-1"
                  />
                ) : (
                  <StartConversationButton
                    trainerId={trainer.id}
                    trainerName={trainerName}
                    size="sm"
                    className="flex-1"
                    variant="default"
                    bypassShortlistRequirement={true}
                  />
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLeaveWaitlist(trainer.id)}
                  className="flex-1"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove from Waitlist
                </Button>
              </div>
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

  // Show comparison view if active
  if (showComparison) {
    return (
      <ComparisonView 
        trainers={getSelectedTrainersData()}
        onClose={() => {
          setShowComparison(false);
          setSelectedForComparison([]);
        }}
      />
    );
  }

  // Enhanced error handling and logging
  console.log('🔍 MyTrainers render state:', {
    user: !!user,
    profile: !!profile,
    filteredTrainers: filteredTrainers?.length,
    isDataReady,
    showComparison,
    allTrainers: allTrainers?.length,
    counts,
    activeFilter,
    engagementLoading,
    trainersLoading
  });

  // Check for potential null/undefined issues
  if (filteredTrainers && !Array.isArray(filteredTrainers)) {
    console.error('🚨 filteredTrainers is not an array:', filteredTrainers);
  }

  if (allTrainers && !Array.isArray(allTrainers)) {
    console.error('🚨 allTrainers is not an array:', allTrainers);
  }

  try {
    return (
      <div className="space-y-6">
        {/* Header with sync status */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">My Trainers</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        <DataSyncIndicator 
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          isConnected={true}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <Tabs value={activeFilter} onValueChange={(value: any) => setActiveFilter(value)} className="w-full sm:w-auto">
          <TabsList className="grid w-full sm:w-auto grid-cols-6">
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
            <TabsTrigger value="waitlist" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Waitlist ({counts.waitlist})
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Discovery ({counts.discovery})
            </TabsTrigger>
            <TabsTrigger value="declined" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Declined ({counts.declined})
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
      {!isDataReady ? (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonTrainerCard key={index} />
          ))}
        </div>
      ) : filteredTrainers.length > 0 ? (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrainers.map((trainerData) => (
            <div key={`${trainerData.id}-${trainerData.status}`} className="space-y-3">
              <EnhancedTrainerCard
                trainer={trainerData}
                onViewProfile={handleViewProfile}
                cardState={trainerData.status}
                showComparisonCheckbox={true}
                comparisonChecked={selectedForComparison.includes(trainerData.id)}
                onComparisonToggle={handleComparisonToggle}
                comparisonDisabled={!selectedForComparison.includes(trainerData.id) && selectedForComparison.length >= 4}
                onStartConversation={handleStartConversation}
                onBookDiscoveryCall={handleBookDiscoveryCall}
                waitlistRefreshKey={waitlistRefreshKey}
                onMoveToSaved={handleMoveToSaved}
                onRemoveCompletely={trainerData.status !== 'declined' ? handleRemoveCompletely : undefined}
                initialView="instagram"
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
                : `You haven't ${activeFilter === 'saved' ? 'saved' : activeFilter === 'shortlisted' ? 'shortlisted' : activeFilter === 'waitlist' ? 'joined any waitlists for' : activeFilter === 'declined' ? 'declined' : 'booked discovery calls with'} any trainers yet`
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
  } catch (error) {
    console.error('🚨 Error in MyTrainers render:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Error loading My Trainers</div>
          <div className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
}