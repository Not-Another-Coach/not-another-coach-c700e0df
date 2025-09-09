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
import { CheckSquare, Bell, MessageCircle, Settings } from "lucide-react";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { MessagingPopup } from "@/components/MessagingPopup";
import { HighlightsCarousel } from "@/components/dashboard/HighlightsCarousel";
import { MetricsSnapshot } from "@/components/dashboard/MetricsSnapshot";
import { ClientActivityFeed } from "@/components/dashboard/ClientActivityFeed";
import { MyTrainersCarousel } from "@/components/dashboard/MyTrainersCarousel";
import { ActivityCompletionInterface } from "@/components/client/ActivityCompletionInterface";
import { ExploreSection } from "@/components/dashboard/ExploreSection";
import { supabase } from "@/integrations/supabase/client";

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
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto px-6 lg:px-8 xl:px-12 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="font-bold text-xl text-foreground">FitQuest</div>
              <div className="text-muted-foreground">Dashboard</div>
              {journeyProgress && (
                <div className="text-xs text-muted-foreground/80 font-medium">
                  {formatJourneyStage(journeyProgress.stage)}
                </div>
              )}
              {/* Your Journey Progress */}
              {journeyProgress && (
                <div className="flex items-center gap-2 ml-6 px-3 py-1 bg-primary/10 rounded-full">
                  <div className="text-sm font-medium text-primary">
                    Your Journey: {journeyProgress.percentage}% Complete
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/client/journey')}
                    className="text-xs h-6 px-2 text-primary hover:bg-primary/20"
                  >
                    View
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

      {/* Main Content - Scrollable Sections */}
      <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6 space-y-8">
        
        {/* Active Client Onboarding Section (Priority) */}
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

        {/* Section 2: My Snapshot (Metrics) */}
        <MetricsSnapshot onTabChange={handleTabChange} />

        {/* Section 3: My Trainers Carousel */}
        <MyTrainersCarousel onTabChange={handleTabChange} />

        {/* Section 4: Enhanced Explore Section with Swipeable Trainers */}
        <ExploreSection 
          isActiveClient={isActiveClient}
          journeyProgress={journeyProgress}
        />

        {/* Section 5: Live Activity Feed */}
        <ClientActivityFeed />

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