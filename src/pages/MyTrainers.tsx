import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComparisonView } from "@/components/ComparisonView";
import { useUnifiedTrainerData } from "@/hooks/useUnifiedTrainerData";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { useDiscoveryCallNotifications } from "@/hooks/useDiscoveryCallNotifications";
import { ErrorBoundary, TrainerDataErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedTrainerCard } from "@/components/trainer-cards/EnhancedTrainerCard";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { MessagingPopup } from "@/components/MessagingPopup";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { SkeletonTrainerCard } from "@/components/ui/skeleton-trainer-card";
import { 
  ArrowLeft, 
  Users,
  BarChart3,
  Bell,
  MessageCircle,
  Settings,
  RefreshCw,
  Eye
} from "lucide-react";
import { AppLogo } from "@/components/ui/app-logo";
import { DiscoveryCallBookingModal } from "@/components/discovery-call/DiscoveryCallBookingModal";

export default function MyTrainers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useClientProfile();
  const { progress: journeyProgress } = useClientJourneyProgress();
  const { notifications, upcomingCalls } = useDiscoveryCallNotifications();
  
  // Unified trainer data hook
  const {
    trainers,
    loading,
    error,
    counts,
    saveTrainer,
    unsaveTrainer,
    shortlistTrainer,
    removeFromShortlist,
    joinWaitlist,
    refreshData,
    filterTrainers
  } = useUnifiedTrainerData();

  // State for filtering and UI
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'shortlisted' | 'discovery' | 'declined' | 'waitlist'>('all');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

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

  // Get filtered trainers based on active filter - memoized for performance
  const filteredTrainers = useMemo(() => {
    return filterTrainers(activeFilter);
  }, [filterTrainers, activeFilter]);

  // Debug logging (optimized)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 MyTrainers state:', {
        user: !!user,
        trainersCount: trainers.length,
        filteredCount: filteredTrainers.length,
        counts,
        activeFilter,
        loading,
        error
      });
    }
  }, [user, trainers.length, filteredTrainers.length, counts, activeFilter, loading, error]);

  // Optimized handler functions
  const handleSaveTrainer = async (trainerId: string) => {
    await saveTrainer(trainerId);
  };

  const handleUnsaveTrainer = async (trainerId: string) => {
    await unsaveTrainer(trainerId);
  };

  const handleAddToShortlist = async (trainerId: string) => {
    await shortlistTrainer(trainerId);
  };

  const handleRemoveFromShortlist = async (trainerId: string) => {
    await removeFromShortlist(trainerId);
  };

  const handleStartConversation = (trainerId: string) => {
    const event = new CustomEvent('openMessagePopup', {
      detail: { trainerId }
    });
    window.dispatchEvent(event);
  };

  const [selectedTrainerForCall, setSelectedTrainerForCall] = useState<string | null>(null);

  // Helper function to format journey stage
  const formatJourneyStage = (stage: string) => {
    switch (stage) {
      case 'profile_setup': return 'Setting Up Profile';
      case 'exploring_coaches': return 'Exploring Trainers';
      case 'browsing': return 'Browsing';
      case 'liked': return 'Finding Favorites';
      case 'shortlisted': return 'Shortlisted Trainers';
      case 'discovery_in_progress': return 'Discovery Process';
      case 'discovery_call_booked': return 'Call Scheduled';
      case 'discovery_completed': return 'Discovery Complete';
      case 'waitlist': return 'On Waitlist';
      case 'active_client': return 'Active Client';
      default: return 'Getting Started';
    }
  };

  const handleBookDiscoveryCall = async (trainerId: string) => {
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
    if (selectedForComparison.length >= 2) {
      setShowComparison(true);
    }
  };

  const getSelectedTrainersData = () => {
    return trainers.filter(trainer => selectedForComparison.includes(trainer.id));
  };

  const handleJoinWaitlist = async (trainerId: string) => {
    await joinWaitlist(trainerId);
  };

  // Smart initial view selection based on trainer content
  const getSmartInitialView = (trainer: any) => {
    // Check if trainer has testimonials with transformations
    const testimonials = trainer.testimonials || [];
    const hasTransformations = testimonials.some((t: any) => 
      t.showImages && t.beforeImage && t.afterImage && t.consentGiven
    );
    
    if (hasTransformations) {
      return 'transformations';
    }
    
    // Default to Instagram view for photo-focused trainers
    return 'instagram';
  };

  // Loading states
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show comparison view if active
  if (showComparison) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          {/* Enhanced Header */}
          <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="mx-auto px-6 lg:px-8 xl:px-12 py-3">
              <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <AppLogo onClick={() => navigate('/client/dashboard')} />
                 <div className="text-muted-foreground">Your Journey</div>
                 {/* Your Journey Progress */}
                 {journeyProgress && (
                   <div className="flex items-center gap-2 ml-6 px-3 py-1 bg-primary/10 rounded-full">
                     <div className="text-sm font-medium text-primary">
                       {formatJourneyStage(journeyProgress.stage)} • {journeyProgress.percentage}% Complete
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm"
                       onClick={() => navigate('/client/journey')}
                       className="h-6 w-6 p-0 rounded-full hover:bg-primary/20"
                     >
                       <Eye className="h-3 w-3" />
                     </Button>
                   </div>
                 )}
                 </div>
                <div className="flex items-center gap-3">
                  {/* Notifications */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                        <Bell className="h-4 w-4" />
                        {(notifications.length > 0 || upcomingCalls.length > 0) && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                          >
                            {notifications.length + upcomingCalls.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">Notifications</h4>
                        {upcomingCalls.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Upcoming Calls</p>
                            {upcomingCalls.slice(0, 3).map((call) => (
                              <div key={call.id} className="p-2 bg-muted/50 rounded text-xs">
                                <p className="font-medium">Discovery Call</p>
                                <p className="text-muted-foreground">
                                  {new Date(call.scheduled_for).toLocaleDateString()} at{' '}
                                  {new Date(call.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {notifications.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Recent Notifications</p>
                            {notifications.slice(0, 3).map((notification) => (
                              <div key={notification.id} className="p-2 bg-muted/50 rounded text-xs">
                                <p className="text-muted-foreground">
                                  {notification.notification_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {notifications.length === 0 && upcomingCalls.length === 0 && (
                          <p className="text-xs text-muted-foreground">No new notifications</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Messaging */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0"
                    onClick={() => setIsMessagingOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>

                  {/* Preferences */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/client-survey')}
                    className="flex items-center gap-2 h-9 px-3"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Preferences</span>
                  </Button>

                  {/* Profile Dropdown */}
                  {profile && <ProfileDropdown profile={profile} />}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setShowComparison(false)}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainers
              </Button>
              <h1 className="text-2xl font-bold">Compare Trainers</h1>
            </div>
            
            <ComparisonView 
              trainers={getSelectedTrainersData() as any} 
              onClose={() => setShowComparison(false)}
            />
          </main>

          <FloatingMessageButton />

          {/* Messaging Popup */}
          <MessagingPopup 
            isOpen={isMessagingOpen}
            onClose={() => setIsMessagingOpen(false)}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="mx-auto px-6 lg:px-8 xl:px-12 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AppLogo onClick={() => navigate('/client/dashboard')} />
                  <div className="text-muted-foreground">Your Journey</div>
                  {/* Your Journey Progress */}
                  {journeyProgress && (
                    <div className="flex items-center gap-2 ml-6 px-3 py-1 bg-primary/10 rounded-full">
                      <div className="text-sm font-medium text-primary">
                        {formatJourneyStage(journeyProgress.stage)} • {journeyProgress.percentage}% Complete
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate('/client/journey')}
                        className="h-6 w-6 p-0 rounded-full hover:bg-primary/20"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                      <Bell className="h-4 w-4" />
                      {(notifications.length > 0 || upcomingCalls.length > 0) && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        >
                          {notifications.length + upcomingCalls.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Notifications</h4>
                      {upcomingCalls.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Upcoming Calls</p>
                          {upcomingCalls.slice(0, 3).map((call) => (
                            <div key={call.id} className="p-2 bg-muted/50 rounded text-xs">
                              <p className="font-medium">Discovery Call</p>
                              <p className="text-muted-foreground">
                                {new Date(call.scheduled_for).toLocaleDateString()} at{' '}
                                {new Date(call.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {notifications.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Recent Notifications</p>
                          {notifications.slice(0, 3).map((notification) => (
                            <div key={notification.id} className="p-2 bg-muted/50 rounded text-xs">
                              <p className="text-muted-foreground">
                                {notification.notification_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {notifications.length === 0 && upcomingCalls.length === 0 && (
                        <p className="text-xs text-muted-foreground">No new notifications</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Messaging */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0"
                  onClick={() => setIsMessagingOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>

                {/* Preferences */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/client-survey')}
                  className="flex items-center gap-2 h-9 px-3"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Preferences</span>
                </Button>

                {/* Profile Dropdown */}
                {profile && <ProfileDropdown profile={profile} />}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6 space-y-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">My Trainers</h1>
            {error && (
              <Badge variant="destructive" className="ml-2">
                Error loading data
              </Badge>
            )}
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all" className="relative">
                  All
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {counts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="saved" className="relative">
                  Saved
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {counts.saved}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="shortlisted" className="relative">
                  Shortlisted
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {counts.shortlisted}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="discovery" className="relative">
                  Discovery
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {counts.discovery}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="waitlist" className="relative">
                  Waitlist
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {counts.waitlist}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="declined" className="relative">
                  Declined
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {counts.declined}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {selectedForComparison.length >= 2 && !showComparison && (
                <Button
                  onClick={handleStartComparison}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Compare ({selectedForComparison.length})
                </Button>
              )}
            </div>

            <TabsContent value={activeFilter} className="mt-6">
              <TrainerDataErrorBoundary>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <SkeletonTrainerCard key={index} />
                    ))
                  ) : error ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-destructive mb-4">{error}</p>
                      <Button onClick={refreshData} variant="outline">
                        Retry
                      </Button>
                    </div>
                  ) : filteredTrainers.length > 0 ? (
                     filteredTrainers.map((trainer) => (
                       <div key={trainer.id} className="relative">
                         <EnhancedTrainerCard
                           trainer={trainer as any}
                           onAddToShortlist={handleAddToShortlist}
                           onStartConversation={handleStartConversation}
                           onBookDiscoveryCall={handleBookDiscoveryCall}
                           onViewProfile={handleViewProfile}
                           isShortlisted={!!trainer.shortlistedAt}
                           initialView={getSmartInitialView(trainer)}
                         />
                         {!showComparison && (
                           <div className="absolute top-2 right-2">
                             <input
                               type="checkbox"
                               checked={selectedForComparison.includes(trainer.id)}
                               onChange={() => handleComparisonToggle(trainer.id)}
                               className="rounded"
                             />
                           </div>
                         )}
                       </div>
                     ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
                      <p className="text-muted-foreground mb-4">
                        {activeFilter === 'all' 
                          ? "You haven't saved or shortlisted any trainers yet."
                          : `No ${activeFilter} trainers found.`
                        }
                      </p>
                      {activeFilter !== 'all' && (
                        <Button
                          onClick={() => setActiveFilter('all')}
                          variant="outline"
                          className="mr-2"
                        >
                          View All Trainers
                        </Button>
                      )}
                      <Button onClick={() => navigate('/client/explore')}>
                        Explore Trainers
                      </Button>
                    </div>
                  )}
                </div>
              </TrainerDataErrorBoundary>
            </TabsContent>
          </Tabs>
        </main>

        <FloatingMessageButton />

        {/* Discovery Call Booking Modal */}
        <DiscoveryCallBookingModal
          isOpen={!!selectedTrainerForCall}
          trainer={trainers.find(t => t.id === selectedTrainerForCall)}
          onClose={() => {
            setSelectedTrainerForCall(null);
            refreshData();
          }}
        />

        {/* Messaging Popup */}
        <MessagingPopup 
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}