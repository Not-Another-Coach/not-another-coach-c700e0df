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
  User,
  Briefcase,
  Database
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
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "users", label: "Users & Access", icon: Users },
    { key: "content", label: "Content", icon: FileText },
    { key: "analytics", label: "Data & Analytics", icon: BarChart3 },
    { key: "system", label: "System", icon: Settings }
  ];

  const handleNavigation = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/trainer/dashboard')}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Trainer View
          </Button>
          
          <ProfileDropdown 
            profile={profile}
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
                  onClick={() => handleNavigation(item.key)}
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