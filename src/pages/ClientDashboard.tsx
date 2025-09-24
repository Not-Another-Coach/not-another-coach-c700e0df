import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { OnboardingHeroCard } from "@/components/onboarding/OnboardingHeroCard";
import { OnboardingProgressTracker } from "@/components/onboarding/OnboardingProgressTracker";
import { TodaysNextSteps } from "@/components/onboarding/TodaysNextSteps";
import { QuickActionsBar } from "@/components/onboarding/QuickActionsBar";
import { SetupChecklist } from "@/components/onboarding/SetupChecklist";
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
    onboardingData, 
    markStepComplete,
    loading: onboardingLoading
  } = useClientOnboarding();
  
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
        {isActiveClient && onboardingData ? (
          <>
            {/* Hero Card - Merged Welcome + Progress + Trainer */}
            <OnboardingHeroCard
              clientName={profile?.first_name || "there"}
              trainerName={onboardingData.trainerName}
              trainerPhoto={null} // Would need to fetch from trainer profile
              trainerTagline="Your Personal Trainer" // Could be dynamic
              currentStep={onboardingData.completedCount + 1}
              totalSteps={onboardingData.totalCount}
              completionPercentage={onboardingData.percentageComplete}
              nextAction={onboardingData.steps.find(s => s.status === 'pending')?.step_name || "Continue onboarding"}
              templateName={onboardingData.templateName}
              steps={adaptStepsForProgressTracker(onboardingData.steps)}
              onNextActionClick={handleNextAction}
              onMessage={() => handleQuickAction('message')}
              onBookSession={() => handleQuickAction('book')}
              onStepClick={handleStepClick}
            />

            {/* Focus Tasks - Streamlined Next Steps */}
            <TodaysNextSteps
              steps={adaptStepsForTodaysNextSteps(onboardingData.steps)}
              onTaskClick={handleStepClick}
            />

            {/* Setup Progress - Milestone-based */}
            <SetupChecklist
              completedSteps={onboardingData.completedCount}
              totalSteps={onboardingData.totalCount}
              sessionsBooked={0} // Would calculate from appointments
              photosUploaded={onboardingData.steps.filter(s => s.requires_file_upload && s.status === 'completed').length}
              formsCompleted={onboardingData.steps.filter(s => s.step_type === 'mandatory' && s.status === 'completed').length}
              totalForms={onboardingData.steps.filter(s => s.step_type === 'mandatory').length}
              onMilestoneClick={handleStatClick}
            />


            {/* Curated Content - From Your Trainer */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">From Your Trainer</h2>
                <p className="text-sm text-muted-foreground">Curated for you</p>
              </div>
              <HighlightsCarousel />
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