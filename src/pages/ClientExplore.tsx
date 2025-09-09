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
import { AppLogo } from "@/components/ui/app-logo";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { 
  Loader2, 
  Bell, 
  MessageCircle, 
  Settings 
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
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto px-6 lg:px-8 xl:px-12 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogo onClick={() => navigate('/client/dashboard')} />
              <div className="text-muted-foreground">Your Journey</div>
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