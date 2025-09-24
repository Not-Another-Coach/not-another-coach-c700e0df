import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { useTrainerEngagement } from "@/hooks/useTrainerEngagement";
import { useClientOnboardingEnhanced } from "@/hooks/useClientOnboardingEnhanced";
import { useDiscoveryCallNotifications } from "@/hooks/useDiscoveryCallNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckSquare, Bell, MessageCircle, Settings, Eye } from "lucide-react";
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
import { OnboardingWelcomeBanner } from "@/components/onboarding/OnboardingWelcomeBanner";
import { TrainerSnapshotCard } from "@/components/onboarding/TrainerSnapshotCard";
import { OnboardingProgressTracker } from "@/components/onboarding/OnboardingProgressTracker";
import { TodaysNextSteps } from "@/components/onboarding/TodaysNextSteps";
import { QuickActionsBar } from "@/components/onboarding/QuickActionsBar";
import { GettingStartedStats } from "@/components/onboarding/GettingStartedStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useClientProfile();
  const { progress: journeyProgress, refetch: refetchJourney } = useClientJourneyProgress();
  const { engagements } = useTrainerEngagement();
  const { notifications, upcomingCalls } = useDiscoveryCallNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary"); // Keep for compatibility with MetricsSnapshot
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const { 
    onboardingData: enhancedOnboardingData, 
    markStepComplete: markEnhancedStepComplete, 
    scheduleAppointment
  } = useClientOnboardingEnhanced();
  
  // Additional state for onboarding interactions
  const [selectedStep, setSelectedStep] = useState<any>(null);
  
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

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect clients to client survey if not completed
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && profile.user_type === 'client') {
      const surveyCompleted = profile.quiz_completed && profile.client_survey_completed;
      if (!surveyCompleted) {
        navigate('/client-survey');
        return;
      }
      
      // If survey is complete but they're still on profile_setup stage, trigger journey update
      if (surveyCompleted && journeyProgress?.stage === 'preferences_identified') {
        // Don't redirect, just refetch journey to update the stage
        refetchJourney();
      }
    }
  }, [user, profile, loading, profileLoading, navigate, journeyProgress]);

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
        navigate('/client-survey');
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
    if (enhancedOnboardingData?.steps) {
      const nextStep = enhancedOnboardingData.steps.find(
        step => step.status === 'pending' || step.status === 'in_progress'
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

  // Only render dashboard for clients with completed quiz
  if (!profile || !user || profile.user_type !== 'client' || !profile.quiz_completed) {
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
        
        {/* Onboarding-Focused Dashboard for Active Clients */}
        {isActiveClient && enhancedOnboardingData ? (
          <>
            {/* Welcome Banner */}
            <OnboardingWelcomeBanner
              clientName={profile?.first_name || "there"}
              trainerName={enhancedOnboardingData.trainer_name}
              currentStep={enhancedOnboardingData.total_steps - enhancedOnboardingData.steps.filter(s => s.status === 'pending').length}
              totalSteps={enhancedOnboardingData.total_steps}
              completionPercentage={enhancedOnboardingData.completion_percentage}
              nextAction={enhancedOnboardingData.steps.find(s => s.status === 'pending')?.activity_name || "Continue onboarding"}
              onNextActionClick={handleNextAction}
            />

            {/* Trainer Snapshot */}
            <TrainerSnapshotCard
              trainerName={enhancedOnboardingData.trainer_name}
              trainerPhoto={null} // Would need to fetch from trainer profile
              trainerTagline="Your Personal Trainer" // Could be dynamic
              onMessage={() => handleQuickAction('message')}
              onBookSession={() => handleQuickAction('book')}
            />

            {/* Quick Actions */}
            <QuickActionsBar
              onBookSession={() => handleQuickAction('book')}
              onUploadPhoto={() => handleQuickAction('upload')}
              onSyncApp={() => handleQuickAction('sync')}
              onMessage={() => handleQuickAction('message')}
              hasAppointmentActivity={enhancedOnboardingData.steps.some(s => s.activity_type === 'appointment')}
              hasUploadActivity={enhancedOnboardingData.steps.some(s => s.activity_type === 'file_upload')}
            />

            {/* Today's Next Steps */}
            <TodaysNextSteps
              steps={enhancedOnboardingData.steps}
              onTaskClick={handleStepClick}
            />

            {/* Onboarding Progress Tracker */}
            <OnboardingProgressTracker
              steps={enhancedOnboardingData.steps}
              onStepClick={handleStepClick}
            />

            {/* Getting Started Stats */}
            <GettingStartedStats
              sessionsBooked={0} // Would calculate from appointments
              photosUploaded={enhancedOnboardingData.steps.filter(s => s.activity_type === 'file_upload' && s.status === 'completed').length}
              formsCompleted={enhancedOnboardingData.steps.filter(s => s.activity_type === 'survey' && s.status === 'completed').length}
              totalForms={enhancedOnboardingData.steps.filter(s => s.activity_type === 'survey').length}
              syncsConnected={0} // Would track app integrations
              completedSteps={enhancedOnboardingData.completed_steps}
              totalSteps={enhancedOnboardingData.total_steps}
              onStatClick={handleStatClick}
            />

            {/* Today's Highlights */}
            <HighlightsCarousel />

            {/* Live Activity Feed */}
            <div id="live-activity-tracker">
              <ClientActivityFeed />
            </div>
          </>
        ) : (
          <>
            {/* Exploration-Focused Dashboard for Non-Active Clients */}
            
            {/* Active Client Onboarding Section (Priority) - Compact Version */}
            {isActiveClient && enhancedOnboardingData && (
              <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary-600" />
                    Your Onboarding with {enhancedOnboardingData.trainer_name}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Progress 
                      value={enhancedOnboardingData.completion_percentage} 
                      className="flex-1" 
                    />
                    <span className="text-sm font-medium text-primary-700">
                      {enhancedOnboardingData.completed_steps}/{enhancedOnboardingData.total_steps} Complete ({enhancedOnboardingData.completion_percentage}%)
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enhancedOnboardingData.steps.slice(0, 3).map((step) => (
                    <ActivityCompletionInterface
                      key={step.id}
                      activity={step}
                      onComplete={(completionData) => markEnhancedStepComplete(step.id, completionData)}
                      onScheduleAppointment={step.activity_type === 'appointment' ? 
                        (appointmentData) => scheduleAppointment(step.id, appointmentData) : undefined
                      }
                    />
                  ))}
                  
                  {enhancedOnboardingData.steps.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/onboarding')}
                    >
                      View All Onboarding Steps ({enhancedOnboardingData.steps.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 1: Today's Highlights */}
            <HighlightsCarousel />

            {/* Section 2: My Snapshot (Metrics) - for exploration phase */}
            <MetricsSnapshot onTabChange={handleTabChange} />

            {/* Section 3: My Trainers Carousel */}
            <MyTrainersCarousel onTabChange={handleTabChange} />

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
    </div>
  );
}