import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { AppLogo } from "@/components/ui/app-logo";
import { Bell, MessageCircle, Settings, Eye } from "lucide-react";

interface ClientCustomHeaderProps {
  currentPage: 'dashboard' | 'journey' | 'trainers' | 'explore';
  profile: any;
  journeyProgress?: any;
  notifications?: any[];
  upcomingCalls?: any[];
  onMessagingOpen: () => void;
  showJourneyProgress?: boolean;
}

export function ClientCustomHeader({
  currentPage,
  profile,
  journeyProgress,
  notifications = [],
  upcomingCalls = [],
  onMessagingOpen,
  showJourneyProgress = true
}: ClientCustomHeaderProps) {
  const navigate = useNavigate();

  const formatJourneyStage = (stage: string) => {
    return stage
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleLiveTrackerClick = () => {
    if (currentPage === 'dashboard') {
      const liveActivityElement = document.getElementById('live-activity-tracker');
      if (liveActivityElement) {
        liveActivityElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <AppLogo onClick={() => navigate('/client/dashboard')} />
            <div className="hidden sm:block text-muted-foreground">Your Journey</div>
            {/* Your Journey Progress - Hidden on mobile */}
            {showJourneyProgress && journeyProgress && (
              <div className="hidden md:flex items-center gap-2 ml-6 px-3 py-1 bg-primary/10 rounded-full">
                <div className="text-sm font-medium text-primary">
                  {formatJourneyStage(journeyProgress.stage)}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/client/journey')}
                  className="h-6 w-6 p-0 rounded-full hover:bg-primary/20"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 relative">
                  <Bell className="h-4 w-4" />
                  {(notifications.length > 0 || upcomingCalls.length > 0) && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-[10px] sm:text-xs flex items-center justify-center"
                    >
                      {notifications.length + upcomingCalls.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Notifications</h4>
                  
                  {/* Live Activity Section - Enhanced for all pages */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Live Activity</p>
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                      {journeyProgress && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Journey Progress</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatJourneyStage(journeyProgress.stage)}
                          </p>
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Profile Status: {profile?.client_survey_completed ? 'Complete' : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={handleLiveTrackerClick}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Full Live Tracker
                    </Button>
                  </div>

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
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              onClick={onMessagingOpen}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {/* Preferences */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/client-survey')}
              className="flex items-center gap-2 h-8 sm:h-9 px-2 sm:px-3"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Preferences</span>
            </Button>

            {/* Profile Dropdown */}
            {profile && <ProfileDropdown profile={profile} />}
          </div>
        </div>
      </div>
    </header>
  );
}