import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { EditPreferencesSection } from "@/components/dashboard/EditPreferencesSection";
import { ExploreMatchSection } from "@/components/dashboard/ExploreMatchSection";
import { MessagesSection } from "@/components/dashboard/MessagesSection";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Heart, Settings, Search, MessageCircle, Menu } from "lucide-react";

export default function ClientDashboard() {
  const { user, signOut, loading } = useAuth();
  const { profile, loading: profileLoading, isClient, isTrainer } = useProfile();
  const { savedTrainerIds } = useSavedTrainers();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("summary");

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

  // Redirect clients to client survey if not completed
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && isClient() && !profile.quiz_completed) {
      navigate('/client-survey');
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/saved')}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Saved ({savedTrainerIds.length})
            </Button>
            <ProfileDropdown 
              profile={profile} 
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>

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
              <TabsTrigger value="preferences" className="flex items-center gap-2">
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

            {/* Tab-specific actions */}
            <div className="flex gap-2">
              {activeTab === "explore" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/discovery')}
                >
                  Swipe Mode
                </Button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="summary" className="space-y-6">
            <DashboardSummary 
              profile={profile}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <EditPreferencesSection 
              profile={profile}
            />
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
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
    </div>
  );
}