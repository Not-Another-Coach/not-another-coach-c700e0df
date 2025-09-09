import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExploreAllTrainers } from "@/components/dashboard/ExploreAllTrainers";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { useDiscoveryCallNotifications } from "@/hooks/useDiscoveryCallNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessagingPopup } from "@/components/MessagingPopup";
import { ClientCustomHeader } from "@/components/layout/ClientCustomHeader";
import { 
  Loader2, 
  Bell, 
  MessageCircle, 
  Settings,
  Eye
} from "lucide-react";

const ClientExplore = () => {
  const navigate = useNavigate();
  const { profile, loading } = useClientProfile();
  const { progress: journeyProgress } = useClientJourneyProgress();
  const { notifications, upcomingCalls } = useDiscoveryCallNotifications();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Custom Header */}
      <ClientCustomHeader
        currentPage="explore"
        profile={profile}
        journeyProgress={journeyProgress}
        notifications={notifications}
        upcomingCalls={upcomingCalls}
        onMessagingOpen={() => setIsMessagingOpen(true)}
      />

      {/* Main Content */}
      <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6">
        <ExploreAllTrainers profile={profile} />
      </main>

      {/* Messaging Popup */}
      <MessagingPopup 
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
    </div>
  );
};

export default ClientExplore;