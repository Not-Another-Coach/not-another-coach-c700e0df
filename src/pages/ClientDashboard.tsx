import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { EditPreferencesSection } from "@/components/dashboard/EditPreferencesSection";
import { ExploreAllTrainers } from "@/components/dashboard/ExploreAllTrainers";
import { ClientSurveyWidget } from "@/components/dashboard/ClientSurveyWidget";
import MyTrainers from "./MyTrainers";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { ClientJourneyBreadcrumb } from "@/components/ClientJourneyBreadcrumb";
import { DiscoveryCallFeedbackPrompt } from "@/components/dashboard/DiscoveryCallFeedbackPrompt";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { ClientHeader } from "@/components/ClientHeader";
import { WaitlistExclusiveAccessWidget } from "@/components/dashboard/WaitlistExclusiveAccessWidget";
import { OnboardingSection } from "@/components/dashboard/OnboardingSection";
import { ClientOnboardingSection } from "@/components/dashboard/ClientOnboardingSection";
import { useTrainerEngagement } from "@/hooks/useTrainerEngagement";
import { ClientPaymentWidget } from "@/components/payment/ClientPaymentWidget";
import { useClientOnboarding } from "@/hooks/useClientOnboarding";
import { useClientOnboardingEnhanced } from "@/hooks/useClientOnboardingEnhanced";
import { ActivityCompletionInterface } from "@/components/client/ActivityCompletionInterface";
import { Heart, Settings, Search, MessageCircle, Menu, Users, Shuffle, Shield, ChevronRight, Home, User, UserSearch, CheckSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export default function ClientDashboard() {
  const { user, signOut, loading } = useAuth();
  const { profile, loading: profileLoading } = useClientProfile();
  
  const { isAdmin } = useUserRoles();
  const { progress: journeyProgress, loading: journeyLoading } = useClientJourneyProgress();
  const { engagements } = useTrainerEngagement();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("summary");
  const [completedDiscoveryCalls, setCompletedDiscoveryCalls] = useState([]);
  const [dismissedFeedbackPrompts, setDismissedFeedbackPrompts] = useState<string[]>([]);
  const { onboardingData, loading: onboardingLoading, markStepComplete, skipStep } = useClientOnboarding();
  const { 
    onboardingData: enhancedOnboardingData, 
    loading: enhancedOnboardingLoading, 
    markStepComplete: markEnhancedStepComplete, 
    scheduleAppointment, 
    skipStep: skipEnhancedStep 
  } = useClientOnboardingEnhanced();
  
  console.log('🔍 ClientDashboard: Current engagements:', engagements);
  console.log('🔍 ClientDashboard: Engagement stages:', engagements.map(e => ({ trainerId: e.trainerId, stage: e.stage })));
  
  // Check if client is an active client with any trainer
  const isActiveClient = engagements.some(engagement => engagement.stage === 'active_client');
  
  console.log('🔍 ClientDashboard: isActiveClient?', isActiveClient);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // ClientDashboard should only be accessed by clients - no trainer redirect needed

  // Load completed discovery calls for feedback prompts
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
        const formattedCalls = data.map(call => ({
          ...call,
          trainer_profile: call.profiles
        }));
        setCompletedDiscoveryCalls(formattedCalls);
      }
    };

    loadCompletedCalls();
  }, [user]);

  const handleDismissFeedback = (callId: string) => {
    setDismissedFeedbackPrompts(prev => [...prev, callId]);
  };

  // Redirect clients to client survey if not completed (check both flags)
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && profile.user_type === 'client') {
      const surveyCompleted = profile.quiz_completed && profile.client_survey_completed;
      if (!surveyCompleted) {
        navigate('/client-survey');
      }
    }
  }, [user, profile, loading, profileLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <ClientHeader 
        profile={profile}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isActiveClient={isActiveClient}
      />


      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">

          {/* Tab Content */}
          {activeTab === "summary" && !isActiveClient && (
            <div className="space-y-6">
              {/* Waitlist Exclusive Access */}
              <WaitlistExclusiveAccessWidget />
              
              {/* Discovery Call Feedback Prompts */}
              {completedDiscoveryCalls.length > 0 && (
                <DiscoveryCallFeedbackPrompt 
                  completedCalls={completedDiscoveryCalls.filter(call => 
                    !dismissedFeedbackPrompts.includes(call.id)
                  )}
                  onDismiss={handleDismissFeedback}
                />
              )}
              
              <DashboardSummary 
                profile={profile}
                onTabChange={setActiveTab}
              />
            </div>
          )}

          {activeTab === "summary" && isActiveClient && (
            <div className="space-y-6">
              {/* Enhanced Onboarding Section */}
              {enhancedOnboardingData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Your Onboarding with {enhancedOnboardingData.trainer_name}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={enhancedOnboardingData.completion_percentage} 
                        className="flex-1" 
                      />
                      <span className="text-sm font-medium">
                        {enhancedOnboardingData.completed_steps}/{enhancedOnboardingData.total_steps} Complete
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
                        onClick={() => setActiveTab('onboarding')}
                      >
                        View All Onboarding Steps ({enhancedOnboardingData.steps.length})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <OnboardingSection profile={profile} />
              )}
            </div>
          )}

          {activeTab === "onboarding" && isActiveClient && (
            <div className="space-y-6">
              {enhancedOnboardingData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Onboarding with {enhancedOnboardingData.trainer_name}</CardTitle>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={enhancedOnboardingData.completion_percentage} 
                        className="flex-1" 
                      />
                      <span className="text-sm font-medium">
                        {enhancedOnboardingData.completed_steps}/{enhancedOnboardingData.total_steps} Complete ({enhancedOnboardingData.completion_percentage}%)
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {enhancedOnboardingData.steps.map((step) => (
                      <ActivityCompletionInterface
                        key={step.id}
                        activity={step}
                        onComplete={(completionData) => markEnhancedStepComplete(step.id, completionData)}
                        onScheduleAppointment={step.activity_type === 'appointment' ? 
                          (appointmentData) => scheduleAppointment(step.id, appointmentData) : undefined
                        }
                      />
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <ClientOnboardingSection />
              )}
            </div>
          )}

          {!isActiveClient && activeTab === "preferences" && (
            <div className="space-y-6">
              <ClientSurveyWidget profile={profile} />
            </div>
          )}

          {!isActiveClient && activeTab === "my-trainers" && (
            <div className="space-y-6">
              <MyTrainers />
            </div>
          )}

          {!isActiveClient && activeTab === "explore" && (
            <div className="space-y-6">
              <ExploreAllTrainers 
                profile={profile}
              />
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <ClientPaymentWidget />
            </div>
          )}
        </div>
      </div>

      {/* Floating Message Button */}
      <FloatingMessageButton />
    </div>
  );
}