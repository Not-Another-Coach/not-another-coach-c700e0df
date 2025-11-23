import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { useTrainerEngagement } from "@/hooks/useTrainerEngagement";
import { useClientOnboarding } from "@/hooks/useClientOnboarding";
import { useDiscoveryCallNotifications } from "@/hooks/useDiscoveryCallNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckSquare, Bell, MessageCircle, Settings, Eye, Calendar, Clock, User } from "lucide-react";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { MessagingPopup } from "@/components/MessagingPopup";
import { HighlightsCarousel } from "@/components/dashboard/HighlightsCarousel";
import { MetricsSnapshot } from "@/components/dashboard/MetricsSnapshot";
import { ClientActivityFeed } from "@/components/dashboard/ClientActivityFeed";
import { MyTrainersCarousel } from "@/components/dashboard/MyTrainersCarousel";
import { ActivityCompletionInterface } from "@/components/client/ActivityCompletionInterface";
import { ExploreSection } from "@/components/dashboard/ExploreSection";
import { ClientCustomHeader } from "@/components/layout/ClientCustomHeader";
import { OnboardingHeroCard } from "@/components/onboarding/OnboardingHeroCard";
import { OnboardingProgressTracker } from "@/components/onboarding/OnboardingProgressTracker";
import { TodaysNextSteps } from "@/components/onboarding/TodaysNextSteps";
import { QuickActionsBar } from "@/components/onboarding/QuickActionsBar";
import { SetupChecklist } from "@/components/onboarding/SetupChecklist";
import { ManageDiscoveryCallModal } from "@/components/discovery-call/ManageDiscoveryCallModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useClientProfile();
  const { progress: journeyProgress, refetch: refetchJourney } = useClientJourneyProgress();
  const { engagements } = useTrainerEngagement();
  const { notifications, upcomingCalls } = useDiscoveryCallNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("summary"); // Keep for compatibility with MetricsSnapshot
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const { 
    onboardingData, 
    markStepComplete,
    loading: onboardingLoading
  } = useClientOnboarding();
  
  // Check if client has advanced engagements (beyond survey stage)
  const hasAdvancedEngagement = engagements.some(
    e => e.stage === 'discovery_completed' || 
         e.stage === 'matched' || 
         e.stage === 'active_client' ||
         e.discoveryCompletedAt !== null ||
         e.becameClientAt !== null
  );
  
  // Helper functions to adapt data structures for components
  const adaptStepsForTodaysNextSteps = (steps: import("@/hooks/useClientOnboarding").OnboardingStep[]) => {
    return steps.map(step => ({
      id: step.id,
      activity_name: step.step_name,
      activity_type: step.requires_file_upload ? 'file_upload' as const : 'task' as const,
      status: step.status,
      due_at: step.completed_at,
      description: step.description
    }));
  };

  const adaptStepsForProgressTracker = (steps: import("@/hooks/useClientOnboarding").OnboardingStep[]) => {
    return steps.map(step => ({
      id: step.id,
      activity_name: step.step_name,
      activity_type: step.requires_file_upload ? 'file_upload' as const : 'task' as const,
      status: step.status,
      due_at: step.completed_at,
      description: step.description
    }));
  };

  const adaptStepForActivityCompletion = (step: import("@/hooks/useClientOnboarding").OnboardingStep) => {
    return {
      id: step.id,
      activity_name: step.step_name,
      description: step.description,
      activity_type: step.requires_file_upload ? 'file_upload' as const : 'task' as const,
      status: step.status,
      instructions: step.instructions,
      completion_method: step.completion_method,
      requires_file_upload: step.requires_file_upload,
      upload_config: step.requires_file_upload ? { max_files: 5 } : undefined
    };
  };
  
  // Check if client is an active client with any trainer
  const isActiveClient = engagements.some(engagement => engagement.stage === 'active_client');

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

  // Additional state for onboarding interactions
  const [selectedStep, setSelectedStep] = useState<any>(null);
  
  // Manage Discovery Call modal state
  const [selectedManageCall, setSelectedManageCall] = useState<any>(null);
  const [selectedManageTrainer, setSelectedManageTrainer] = useState<{ id: string; name: string; profilePhotoUrl?: string } | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check if survey is incomplete to show CTA (only if they haven't progressed beyond survey stage)
  // Hide preferences CTA once they're in onboarding or beyond, or if there's a scheduled call
  const isInOnboardingOrBeyond = journeyProgress?.stage === 'onboarding_in_progress' || journeyProgress?.stage === 'on_your_journey';
  const hasScheduledCall = (upcomingCalls?.length ?? 0) > 0;
  const surveyIncomplete = profile && !profile.client_survey_completed && !hasAdvancedEngagement && !isInOnboardingOrBeyond && !hasScheduledCall;
  
  // Refetch journey when upcoming calls change
  useEffect(() => {
    if (upcomingCalls) {
      refetchJourney();
    }
  }, [upcomingCalls?.length, refetchJourney]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Navigate to other pages based on tab
    switch (tab) {
      case 'my-trainers':
        navigate('/my-trainers');
        break;
      case 'explore':
        navigate('/client/explore');
        break;
      case 'preferences':
        navigate('/client-survey', { state: { editMode: true, cachedProfile: profile } });
        break;
      case 'payments':
        navigate('/payments');
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  // Onboarding interaction handlers
  const handleStepClick = (step: any) => {
    setSelectedStep(step);
    // You could open a modal or navigate to specific step
  };

  const handleNextAction = () => {
    if (onboardingData?.steps) {
      const nextStep = onboardingData.steps.find(
        step => step.status === 'pending'
      );
      if (nextStep) {
        handleStepClick(nextStep);
      }
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'book':
        // Navigate to booking or open appointment modal
        toast({ title: "Booking", description: "Opening appointment booking..." });
        break;
      case 'upload':
        // Open file upload
        toast({ title: "Upload", description: "Opening file upload..." });
        break;
      case 'sync':
        // Open app sync
        toast({ title: "Sync", description: "Opening app sync..." });
        break;
      case 'message':
        setIsMessagingOpen(true);
        break;
    }
  };

  const handleStatClick = (statType: string) => {
    // Navigate or filter based on stat type
    switch (statType) {
      case 'sessions':
        toast({ title: "Sessions", description: "Viewing your booked sessions..." });
        break;
      case 'photos':
        toast({ title: "Photos", description: "Viewing your uploaded photos..." });
        break;
      case 'forms':
        toast({ title: "Forms", description: "Viewing your forms..." });
        break;
      case 'progress':
        toast({ title: "Progress", description: "Viewing your overall progress..." });
        break;
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Only render dashboard for clients
  if (!profile || !user || profile.user_type !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ClientCustomHeader
        currentPage="dashboard"
        profile={profile}
        journeyProgress={journeyProgress}
        notifications={notifications}
        upcomingCalls={upcomingCalls}
        onMessagingOpen={() => setIsMessagingOpen(true)}
      />

      {/* Main Content - Conditional Layout */}
      <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6 space-y-8">
        
        {/* Survey Incomplete CTA */}
        {surveyIncomplete && (
          <Card className="border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    Complete Your Preferences
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    To unlock your personalized dashboard and start matching with trainers, 
                    please complete your fitness preferences survey.
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={() => navigate('/client-survey')}
                  className="mt-4"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Complete Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        
        {/* Onboarding-Focused Dashboard for Active Clients */}
        {isActiveClient && onboardingData ? (
          <>
            {/* Hero Card - Merged Welcome + Progress + Trainer */}
            <OnboardingHeroCard
              clientName={profile?.first_name || "there"}
              trainerName={onboardingData.trainerName}
              trainerPhoto={onboardingData.trainerPhoto}
              trainerTagline="Your Personal Trainer"
              currentStep={onboardingData.completedCount + 1}
              totalSteps={onboardingData.totalCount}
              completionPercentage={onboardingData.percentageComplete}
              nextAction={onboardingData.steps.find(s => s.status === 'pending')?.step_name || "Continue onboarding"}
              templateName={onboardingData.templateName}
              steps={adaptStepsForProgressTracker(onboardingData.steps)}
              onNextActionClick={handleNextAction}
              onMessage={() => handleQuickAction('message')}
              onStepClick={handleStepClick}
              showCelebration={journeyProgress?.showCelebration || false}
            />

            {/* Today's Highlights */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-hero p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <div className="relative z-10">
                <HighlightsCarousel />
              </div>
            </div>

            {/* Focus Tasks & Setup Progress - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodaysNextSteps
                steps={adaptStepsForTodaysNextSteps(onboardingData.steps)}
                onTaskClick={handleStepClick}
              />
              
              <SetupChecklist
                completedSteps={onboardingData.completedCount}
                totalSteps={onboardingData.totalCount}
                sessionsBooked={0} // Would calculate from appointments
                photosUploaded={onboardingData.steps.filter(s => s.requires_file_upload && s.status === 'completed').length}
                formsCompleted={onboardingData.steps.filter(s => s.step_type === 'mandatory' && s.status === 'completed').length}
                totalForms={onboardingData.steps.filter(s => s.step_type === 'mandatory').length}
                onMilestoneClick={handleStatClick}
              />
            </div>

            {/* Live Activity Feed - Hidden when empty */}
            <div id="live-activity-tracker">
              <ClientActivityFeed />
            </div>
          </>
        ) : isActiveClient && !onboardingData ? (
          <>
            {/* Placeholder for Active Client with No Template Assigned */}
            <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <CheckSquare className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Welcome, {profile?.first_name || "there"}!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your trainer is preparing your personalized onboarding plan. 
                      You'll see your next steps here once they've set up your program.
                    </p>
                    <p className="text-sm text-primary-700 bg-primary-50 rounded-lg p-3 inline-block">
                      💡 In the meantime, feel free to explore the platform and check out today's highlights below.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsMessagingOpen(true)}
                    className="mt-4"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Your Trainer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Feed */}
            <div id="live-activity-tracker">
              <ClientActivityFeed />
            </div>
          </>
        ) : (
          <>
            {/* Exploration-Focused Dashboard for Non-Active Clients */}
            
            {/* Active Client Onboarding Section (Priority) - Compact Version */}
            {isActiveClient && onboardingData && (
              <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary-600" />
                    Your Onboarding with {onboardingData.trainerName}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Progress 
                      value={onboardingData.percentageComplete} 
                      className="flex-1" 
                    />
                    <span className="text-sm font-medium text-primary-700">
                      {onboardingData.completedCount}/{onboardingData.totalCount} Complete ({onboardingData.percentageComplete}%)
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {onboardingData.steps.slice(0, 3).map((step) => (
                    <ActivityCompletionInterface
                      key={step.id}
                      activity={adaptStepForActivityCompletion(step)}
                      onComplete={(completionData) => markStepComplete(step.id, completionData)}
                    />
                  ))}
                  
                  {onboardingData.steps.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/onboarding')}
                    >
                      View All Onboarding Steps ({onboardingData.steps.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 1: Today's Highlights */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-hero p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <div className="relative z-10">
                <HighlightsCarousel />
              </div>
            </div>

            {/* Section 2: My Snapshot (Metrics) - for exploration phase */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <MetricsSnapshot onTabChange={handleTabChange} />
              </CardContent>
            </Card>

            {/* Section 3: My Trainers Carousel */}
            <MyTrainersCarousel onTabChange={handleTabChange} />

            {/* Upcoming Appointments - Below My Trainers */}
            {upcomingCalls && upcomingCalls.length > 0 && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingCalls.map((call: any) => (
                    <div 
                      key={call.id}
                      className="flex items-center justify-between p-4 bg-background border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedManageCall(call);
                        setSelectedManageTrainer({ 
                          id: call.trainer_id, 
                          name: `${call.trainer?.first_name ?? ''} ${call.trainer?.last_name ?? ''}`.trim() || 'Trainer',
                          profilePhotoUrl: call.trainer?.profile_photo_url
                        });
                        setShowManageModal(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {call.trainer?.profile_photo_url ? (
                          <img 
                            src={call.trainer.profile_photo_url}
                            alt={`${call.trainer?.first_name ?? ''} ${call.trainer?.last_name ?? ''}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">
                            {`${call.trainer?.first_name ?? ''} ${call.trainer?.last_name ?? ''}`.trim() || 'Trainer'}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(call.scheduled_for), 'MMM do, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(call.scheduled_for), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={call.status === 'scheduled' ? 'default' : 'secondary'}>
                        {call.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Section 4: Enhanced Explore Section with Swipeable Trainers */}
            <ExploreSection 
              isActiveClient={isActiveClient}
              journeyProgress={journeyProgress}
            />

            {/* Section 5: Live Activity Feed */}
            <div id="live-activity-tracker">
              <ClientActivityFeed />
            </div>
          </>
        )}

        {/* Spacer for floating button */}
        <div className="h-20" />
      </main>

      {/* Floating Message Button */}
      <FloatingMessageButton />

      {/* Messaging Popup */}
      <MessagingPopup 
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />

      {/* Manage Discovery Call Modal */}
      {showManageModal && selectedManageCall && selectedManageTrainer && (
        <ManageDiscoveryCallModal
          isOpen={showManageModal}
          discoveryCall={selectedManageCall}
          trainer={selectedManageTrainer}
          onClose={() => setShowManageModal(false)}
          onCallUpdated={() => {
            setShowManageModal(false);
            refetchJourney();
          }}
        />
      )}
    </div>
  );
}