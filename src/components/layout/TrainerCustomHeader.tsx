import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { AppLogo } from "@/components/ui/app-logo";
import { Bell, MessageCircle, Settings } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { useConversations } from "@/hooks/useConversations";
import { format } from "date-fns";

interface TrainerCustomHeaderProps {
  profile: any;
  availabilityStatus: 'accepting' | 'waitlist' | 'unavailable';
  onMessagingOpen: () => void;
}

export function TrainerCustomHeader({
  profile,
  availabilityStatus,
  onMessagingOpen
}: TrainerCustomHeaderProps) {
  const navigate = useNavigate();
  const { alerts } = useAlerts();
  const { conversations } = useConversations();

  // Calculate unread messages count from conversations
  const unreadMessagesCount = conversations.reduce((count, conv) => {
    // For trainers, count messages sent after trainer_last_read_at
    const lastReadAt = conv.trainer_last_read_at;
    
    if (!conv.messages || conv.messages.length === 0) return count;
    
    // If never read, count all messages from the other person (client)
    if (!lastReadAt) {
      const unreadInConv = conv.messages.filter(msg => 
        msg.sender_id !== profile?.id
      ).length;
      return count + unreadInConv;
    }
    
    // Count messages after last read time
    const unreadInConv = conv.messages.filter(msg => 
      new Date(msg.created_at) > new Date(lastReadAt) && 
      msg.sender_id !== profile?.id
    ).length;
    
    return count + unreadInConv;
  }, 0);

  const formatAvailabilityStatus = () => {
    switch (availabilityStatus) {
      case 'accepting':
        return { text: 'Accepting Clients', color: 'bg-success', textColor: 'text-success' };
      case 'waitlist':
        return { text: 'Waitlist Only', color: 'bg-warning', textColor: 'text-warning' };
      case 'unavailable':
        return { text: 'Not Available', color: 'bg-destructive', textColor: 'text-destructive' };
      default:
        return { text: 'Unknown Status', color: 'bg-muted', textColor: 'text-muted-foreground' };
    }
  };

  const statusInfo = formatAvailabilityStatus();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto px-6 lg:px-8 xl:px-12 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo onClick={() => navigate('/trainer/dashboard')} />
            <div className="text-muted-foreground">Mission Control</div>
            
            {/* Availability Status Badge */}
            <div className="flex items-center gap-2 ml-6 px-3 py-1 bg-muted/50 rounded-full">
              <div className={`w-2 h-2 rounded-full ${statusInfo.color} ${availabilityStatus === 'accepting' ? 'animate-pulse' : ''}`} />
              <div className={`text-sm font-medium ${statusInfo.textColor}`}>
                {statusInfo.text}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                  <Bell className="h-4 w-4" />
                  {alerts.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {alerts.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Notifications</h4>
                  
                  {/* Trainer Status Section */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Trainer Status</p>
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Availability Status</span>
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Currently {statusInfo.text.toLowerCase()}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Profile Status: {profile?.profile_completion_percentage || 0}% Complete
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => navigate('/trainer/dashboard')}
                    >
                      View Dashboard
                    </Button>
                  </div>

                  {/* Recent Alerts */}
                  {alerts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Recent Alerts</p>
                      {alerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="p-2 bg-muted/50 rounded text-xs">
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-muted-foreground">
                            {alert.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {alerts.length === 0 && (
                    <p className="text-xs text-muted-foreground">No new notifications</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Messaging */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 relative"
              onClick={onMessagingOpen}
            >
              <MessageCircle className="h-4 w-4" />
              {unreadMessagesCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {unreadMessagesCount}
                </Badge>
              )}
            </Button>

            {/* Profile Settings */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/trainer/profile-setup')}
              className="flex items-center gap-2 h-9 px-3"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Profile Settings</span>
            </Button>

            {/* Profile Dropdown */}
            {profile && (
              <ProfileDropdown 
                profile={{
                  ...profile,
                  user_type: 'trainer'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}