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
    { key: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
    { key: "users", label: "User Management", icon: Users, path: "/admin/users" },
    { key: "verification", label: "Verification", icon: Shield, path: "/admin/verification" },
    { key: "publications", label: "Publications", icon: FileText, path: "/admin/publications" },
    { key: "specialties", label: "Specialties", icon: Database, path: "/admin/specialties" },
    { key: "qualifications", label: "Qualifications", icon: Briefcase, path: "/admin/qualifications" },
    { key: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/specialty-analytics" }
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
            <Badge variant="secondary" className="text-xs">
              System Administrator
            </Badge>
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
          <nav className="flex space-x-1 py-2 overflow-x-auto px-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <Button
                  key={item.key}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2 h-8"
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-3 w-3" />
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