import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useUserRoles } from "@/hooks/useUserRoles";
import { 
  Shield, 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Database,
  Briefcase
} from "lucide-react";

interface AdminHeaderProps {
  profile: any;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showNavigation?: boolean;
}

export function AdminHeader({ 
  profile,
  activeTab = "dashboard", 
  onTabChange, 
  showNavigation = true
}: AdminHeaderProps) {
  const navigate = useNavigate();
  const { users } = useUserRoles();

  const navigationItems = [
    // High Priority
    { key: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
    { key: "users", label: "Users", icon: Users, path: "/admin/users" },
    { key: "verification", label: "Verification", icon: Shield, path: "/admin/verification" },
    { key: "publications", label: "Publications", icon: FileText, path: "/admin/publications" },
    
    // Medium Priority
    { key: "specialties", label: "Specialties", icon: Database, path: "/admin/specialties" },
    { key: "qualifications", label: "Qualifications", icon: Briefcase, path: "/admin/qualifications" },
    { key: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/specialty-analytics" },
    
    // Administrative Functions
    { key: "knowledge-base", label: "Knowledge Base", icon: FileText, path: "/admin/knowledge-base" },
    { key: "templates", label: "Templates", icon: Settings, path: "/admin/templates" },
    { key: "feedback-builder", label: "Feedback", icon: Settings, path: "/admin/feedback-builder" },
    { key: "data-cleanup", label: "Cleanup", icon: Settings, path: "/admin/data-cleanup" }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="sticky top-0 z-50 bg-background border-b">
      {/* Main Header */}
      <div className="flex justify-between items-center p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">
              Admin Control Center
            </h1>
            <Badge variant="outline" className="text-xs">
              {users?.length || 0} Total Users
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProfileDropdown 
            profile={profile}
          />
        </div>
      </div>

      {/* Navigation Menu */}
      {showNavigation && (
        <div className="border-t">
          <nav className="flex space-x-1 py-3 overflow-x-auto px-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <Button
                  key={item.key}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap text-sm px-4 py-2 h-9 font-medium"
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}