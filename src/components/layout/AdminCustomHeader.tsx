import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { AppLogo } from "@/components/ui/app-logo";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Bell, MessageCircle, Users, Shield, FileText, Database, Briefcase, Settings, BarChart3, ChevronDown, Menu, Target, Heart } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        { key: "goals", label: "Goals", icon: Target, path: "/admin/goals" },
        { key: "coaching-styles", label: "Coaching Styles", icon: Heart, path: "/admin/coaching-styles" },
        { key: "qualifications", label: "Qualifications", icon: Briefcase, path: "/admin/qualifications" },
        { key: "templates", label: "Templates", icon: Settings, path: "/admin/templates" },
        { key: "feedback-builder", label: "Feedback", icon: Settings, path: "/admin/feedback-builder" },
        { key: "matching", label: "Matching", icon: Target, path: "/admin/matching-config" },
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
    setMobileMenuOpen(false);
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

      {/* Navigation Menu - Desktop */}
      <div className="border-t border-border/50 hidden md:block">
        <div className="mx-auto px-6 lg:px-8 xl:px-12">
          <nav className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
                    className="w-48 bg-background border border-border shadow-lg z-[100]"
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

      {/* Mobile Menu Button */}
      <div className="border-t border-border/50 md:hidden">
        <div className="mx-auto px-4 py-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Menu className="h-4 w-4" />
                <span>Navigation Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Admin Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  {navigationGroups.map((group, groupIdx) => {
                    const GroupIcon = group.icon;
                    const hasActiveItem = group.items.some(item => window.location.pathname === item.path);
                    
                    return (
                      <AccordionItem key={group.key} value={`group-${groupIdx}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <GroupIcon className="h-4 w-4" />
                            <span className="font-medium">{group.label}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1 pl-6">
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isActive = window.location.pathname === item.path;
                              
                              return (
                                <Button
                                  key={item.key}
                                  variant={isActive ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => handleNavigation(item.path)}
                                  className="justify-start gap-2 w-full"
                                >
                                  <ItemIcon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}