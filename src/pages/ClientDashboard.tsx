import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { EditPreferencesSection } from "@/components/dashboard/EditPreferencesSection";
import { ExploreMatchSection } from "@/components/dashboard/ExploreMatchSection";
import { MessagesSection } from "@/components/dashboard/MessagesSection";
import { UnmatchedTrainers } from "@/components/dashboard/UnmatchedTrainers";
import { ClientSurveyWidget } from "@/components/dashboard/ClientSurveyWidget";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { ClientJourneyBreadcrumb } from "@/components/ClientJourneyBreadcrumb";
import { DiscoveryCallFeedbackPrompt } from "@/components/dashboard/DiscoveryCallFeedbackPrompt";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { Heart, Settings, Search, MessageCircle, Menu, Users, Shuffle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ClientDashboard() {
  const { user, signOut, loading } = useAuth();
  const { profile, loading: profileLoading, isClient, isTrainer } = useProfile();
  
  const { isAdmin } = useUserRoles();
  const { progress: journeyProgress, loading: journeyLoading } = useClientJourneyProgress();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("summary");
  const [completedDiscoveryCalls, setCompletedDiscoveryCalls] = useState([]);
  const [dismissedFeedbackPrompts, setDismissedFeedbackPrompts] = useState<string[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect trainers to their dashboard (only from client dashboard page)
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && isTrainer() && location.pathname === '/client/dashboard') {
      // Check if profile setup is needed
      if (!profile.terms_agreed || !(profile as any).profile_setup_completed) {
        navigate('/trainer/profile-setup');
      } else {
        navigate('/trainer/dashboard');
      }
    }
  }, [user, profile, loading, profileLoading, isTrainer, navigate, location.pathname]);

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
    if (!loading && !profileLoading && user && profile && isClient()) {
      const surveyCompleted = profile.quiz_completed && (profile as any).client_survey_completed;
      if (!surveyCompleted) {
        navigate('/client-survey');
      }
    }
  }, [user, profile, loading, profileLoading, isClient, navigate]);

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
  if (!profile || !user || !isClient() || !profile.quiz_completed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Your Fitness Journey</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            )}
            
            
            <ProfileDropdown 
              profile={profile} 
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>

      {/* Client Journey Progress Tracker - Shows when survey is 100% complete */}
      {journeyProgress && !journeyLoading && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <Card 
            className="mb-4 cursor-pointer transition-all hover:shadow-md bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20"
            onClick={() => navigate('/client/journey')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary">Your Fitness Journey</h3>
                  <p className="text-sm text-muted-foreground">
                    {journeyProgress.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {journeyProgress.percentage}% Complete
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View Details →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList className="grid w-full sm:w-auto grid-cols-4 lg:grid-cols-4">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Explore</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab-specific actions - Removed Swipe Mode button since we now have Swipe tab */}
            <div className="flex gap-2">
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="summary" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <ClientSurveyWidget profile={profile} />
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <UnmatchedTrainers 
              profile={profile}
            />
            <ExploreMatchSection 
              profile={profile}
            />
          </TabsContent>


          <TabsContent value="messages" className="space-y-6">
            <MessagesSection 
              profile={profile}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Message Button */}
      <FloatingMessageButton />
    </div>
  );
}