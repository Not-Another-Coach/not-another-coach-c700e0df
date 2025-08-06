import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Shield, ChevronRight, Home, Settings, Users, UserSearch } from "lucide-react";

interface ClientHeaderProps {
  profile: any;
  onSignOut: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showNavigation?: boolean;
}

export function ClientHeader({ 
  profile, 
  onSignOut, 
  activeTab = "summary", 
  onTabChange, 
  showNavigation = true 
}: ClientHeaderProps) {
  const navigate = useNavigate();
  const { isAdmin } = useUserRoles();
  const { progress: journeyProgress, loading: journeyLoading } = useClientJourneyProgress();

  const navigationItems = [
    { key: "summary", label: "Dashboard", icon: Home, route: "/client/dashboard" },
    { key: "preferences", label: "Preferences", icon: Settings, route: "/client/preferences" },
    { key: "my-trainers", label: "My Trainers", icon: Users, route: "/my-trainers" },
    { key: "explore", label: "Explore", icon: UserSearch, route: "/client/explore" }
  ];

  const handleNavigation = (tab: string, route: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      navigate(route);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background border-b">
      {/* Main Header */}
      <div className="flex justify-between items-center p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">
              Your Fitness Journey, {profile?.first_name || 'Client'}
            </h1>
            {journeyProgress && !journeyLoading && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {journeyProgress.percentage}% Complete
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {journeyProgress.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/client/journey')}
                  className="text-xs h-6 px-2 flex items-center gap-1"
                >
                  View Details
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
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
            onSignOut={onSignOut}
          />
        </div>
      </div>

      {/* Navigation Menu */}
      {showNavigation && (
        <div className="flex items-center px-4 py-2 bg-muted/30">
          <nav className="flex gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.key}
                  variant={activeTab === item.key ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.key, item.route)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}