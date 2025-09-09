import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { AppLogo } from "@/components/ui/app-logo";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Bell, MessageCircle, Users, Shield, FileText, Database, Briefcase, Settings, BarChart3, ChevronDown } from "lucide-react";

interface AdminCustomHeaderProps {
  profile: any;
  activeTab?: string;
}

export function AdminCustomHeader({ 
  profile,
  activeTab = "dashboard"
}: AdminCustomHeaderProps) {
  const navigate = useNavigate();
  const { users } = useUserRoles();

  // Navigation Groups
  const navigationGroups = [
    {
      key: "user-management",
      label: "User Management",
      icon: Users,
      items: [
        { key: "users", label: "Users", icon: Users, path: "/admin/users" },
        { key: "verification", label: "Verification", icon: Shield, path: "/admin/verification" },
        { key: "publications", label: "Publications", icon: FileText, path: "/admin/publications" },
      ]
    },
    {
      key: "configuration",
      label: "Configuration",
      icon: Settings,
      items: [
        { key: "highlights", label: "Highlights", icon: FileText, path: "/admin/highlights" },
        { key: "specialties", label: "Specialties", icon: Database, path: "/admin/specialties" },
        { key: "qualifications", label: "Qualifications", icon: Briefcase, path: "/admin/qualifications" },
        { key: "templates", label: "Templates", icon: Settings, path: "/admin/templates" },
        { key: "feedback-builder", label: "Feedback", icon: Settings, path: "/admin/feedback-builder" },
      ]
    },
    {
      key: "system-settings",
      label: "System Settings",
      icon: Settings,
      items: [
        { key: "system-settings", label: "System Settings", icon: Settings, path: "/admin/system-settings" },
        { key: "data-cleanup", label: "Data Cleanup", icon: Settings, path: "/admin/data-cleanup" },
      ]
    },
    {
      key: "analytics-documents",
      label: "Analytics & Documents",
      icon: BarChart3,
      items: [
        { key: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/specialty-analytics" },
        { key: "knowledge-base", label: "Knowledge Base", icon: FileText, path: "/admin/knowledge-base" },
      ]
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleMessagingOpen = () => {
    // TODO: Implement admin messaging functionality
    console.log("Admin messaging clicked");
  };

  return (
    <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      {/* Main Header */}
      <div className="mx-auto px-6 lg:px-8 xl:px-12 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo onClick={() => navigate('/admin')} />
            <div className="text-muted-foreground">Admin Control Center</div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                  <Bell className="h-4 w-4" />
                  {/* TODO: Add notification count badge when admin notifications are implemented */}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Admin Notifications</h4>
                  
                  {/* System Status */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">System Status</p>
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Users</span>
                          <Badge variant="secondary" className="text-xs">
                            {users?.length || 0}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          System running normally
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">No new notifications</p>
                </div>
              </PopoverContent>
            </Popover>

            {/* Messaging */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0"
              onClick={handleMessagingOpen}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {/* Profile Dropdown */}
            {profile && <ProfileDropdown profile={profile} />}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="border-t border-border/50">
        <div className="mx-auto px-6 lg:px-8 xl:px-12">
          <nav className="flex items-center gap-2 py-3 overflow-x-auto">
            {navigationGroups.map((group) => {
              const GroupIcon = group.icon;
              const hasActiveItem = group.items.some(item => window.location.pathname === item.path);
              
              return (
                <DropdownMenu key={group.key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={hasActiveItem ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2 whitespace-nowrap text-sm px-3 py-2 h-8 font-medium"
                    >
                      <GroupIcon className="h-4 w-4" />
                      <span>{group.label}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="w-48 bg-background border border-border shadow-lg z-50"
                  >
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = window.location.pathname === item.path;
                      
                      return (
                        <DropdownMenuItem
                          key={item.key}
                          onClick={() => handleNavigation(item.path)}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <ItemIcon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}