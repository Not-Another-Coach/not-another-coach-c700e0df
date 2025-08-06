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
import { ClientSurveyWidget } from "@/components/dashboard/ClientSurveyWidget";
import MyTrainers from "./MyTrainers";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { ClientJourneyBreadcrumb } from "@/components/ClientJourneyBreadcrumb";
import { DiscoveryCallFeedbackPrompt } from "@/components/dashboard/DiscoveryCallFeedbackPrompt";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { ClientHeader } from "@/components/ClientHeader";
import { Heart, Settings, Search, MessageCircle, Menu, Users, Shuffle, Shield, ChevronRight, Home, User, UserSearch } from "lucide-react";
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
      <ClientHeader 
        profile={profile}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />


      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">

          {/* Tab Content */}
          {activeTab === "summary" && (
            <div className="space-y-6">
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

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <ClientSurveyWidget profile={profile} />
            </div>
          )}

          {activeTab === "my-trainers" && (
            <div className="space-y-6">
              <MyTrainers />
            </div>
          )}

          {activeTab === "explore" && (
            <div className="space-y-6">
              <ExploreMatchSection 
                profile={profile}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Message Button */}
      <FloatingMessageButton />
    </div>
  );
}