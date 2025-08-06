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
  Clock
} from "lucide-react";
import { DiscoveryCallBookingModal } from "@/components/discovery-call/DiscoveryCallBookingModal";
import { toast } from "sonner";

export default function MyTrainers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { trainers: allTrainers } = useRealTrainers();
  
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
  const { getEngagementStage, getLikedTrainers, getOnlyShortlistedTrainers } = useTrainerEngagement();
  const { hasActiveDiscoveryCall } = useDiscoveryCallData();
  const { getCoachAvailability, checkClientWaitlistStatus, joinWaitlist } = useWaitlist();

  // State for filtering and UI
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'shortlisted' | 'discovery'>('all');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [trainerWaitlistStatus, setTrainerWaitlistStatus] = useState<{[key: string]: any}>({});
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

  // Fetch waitlist status and availability for shortlisted trainers
  useEffect(() => {
    const fetchWaitlistData = async () => {
      const shortlistedTrainers = getOnlyShortlistedTrainers();
      
      for (const engagement of shortlistedTrainers) {
        const trainerId = engagement.trainerId;
        
        try {
          const [availability, waitlistStatus] = await Promise.all([
            getCoachAvailability(trainerId),
            checkClientWaitlistStatus(trainerId)
          ]);
          
          setTrainerAvailability(prev => ({
            ...prev,
            [trainerId]: availability
          }));
          
          setTrainerWaitlistStatus(prev => ({
            ...prev,
            [trainerId]: waitlistStatus
          }));
        } catch (error) {
          console.error(`Error fetching data for trainer ${trainerId}:`, error);
        }
      }
    };
    
    fetchWaitlistData();
  }, [getOnlyShortlistedTrainers, getCoachAvailability, checkClientWaitlistStatus]);

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

    // Get trainers with active discovery calls (scheduled/rescheduled, not cancelled)
    // This includes trainers from engagement stage OR with active discovery calls
    allTrainers.forEach(trainer => {
      if (hasActiveDiscoveryCall(trainer.id)) {
        // Check if already exists in the list
        const existingIndex = allTrainerData.findIndex(t => t.trainer.id === trainer.id);
        
        if (existingIndex >= 0) {
          // Upgrade existing trainer to discovery status
          allTrainerData[existingIndex] = {
            trainer,
            status: 'discovery',
            engagement: allTrainerData[existingIndex].engagement,
            statusLabel: 'Discovery Call',
            statusColor: 'bg-purple-100 text-purple-800'
          };
        } else {
          // Add as new discovery trainer
          allTrainerData.push({
            trainer,
            status: 'discovery',
            engagement: null,
            statusLabel: 'Discovery Call',
            statusColor: 'bg-purple-100 text-purple-800'
          });
        }
      }
    });

    return allTrainerData;
  }, [allTrainers, getLikedTrainers, getOnlyShortlistedTrainers, hasActiveDiscoveryCall]);

  // Filter trainers based on active filter
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
    // Trigger messaging popup
    const event = new CustomEvent('openMessagePopup', {
      detail: { trainerId }
    });
    window.dispatchEvent(event);
  };

  const [selectedTrainerForCall, setSelectedTrainerForCall] = useState<string | null>(null);

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
    try {
      const result = await joinWaitlist(trainerId);
      if (result.error) {
        toast.error('Failed to join waitlist');
      } else {
        toast.success('Joined waitlist! The trainer will contact you when available.');
        // Refresh waitlist status
        setTrainerWaitlistStatus(prev => ({
          ...prev,
          [trainerId]: { status: 'active' }
        }));
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Failed to join waitlist');
    }
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
        const offersDiscoveryCall = trainerData.trainer.offers_discovery_call;
        const trainerId = trainer.id;
        const availability = trainerAvailability[trainerId];
        const waitlistStatus = trainerWaitlistStatus[trainerId];
        const isOnWaitlist = availability?.availability_status === 'waitlist';
        const clientAlreadyOnWaitlist = waitlistStatus !== null;
        
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
              
              {/* Show waitlist button if trainer is on waitlist and client isn't already on it */}
              {isOnWaitlist && !clientAlreadyOnWaitlist ? (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleJoinWaitlist(trainer.id)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Join Waitlist
                </Button>
              ) : isOnWaitlist && clientAlreadyOnWaitlist ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                  title="You're already on this trainer's waitlist"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  On Waitlist
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant={offersDiscoveryCall ? "default" : "outline"}
                  onClick={() => offersDiscoveryCall ? handleBookDiscoveryCall(trainer.id) : null}
                  disabled={!offersDiscoveryCall}
                  className={!offersDiscoveryCall ? "opacity-50 cursor-not-allowed" : ""}
                  title={!offersDiscoveryCall ? "This trainer doesn't offer discovery calls" : "Book a discovery call"}
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
              <Button 
                size="sm" 
                variant="default"
                onClick={() => navigate(`/trainer/${trainer.id}`)}
              >
                <Phone className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
            <Button
              onClick={() => toast.info('Choose coach feature coming soon!')}
              className="w-full"
              size="sm"
              variant="default"
            >
              Choose as Coach
            </Button>
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
    </div>
  );
}