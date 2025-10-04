import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PositionedAvatar } from '@/components/ui/positioned-avatar';
import { Badge } from "@/components/ui/badge";
import { User, Settings, LogOut, Key, Edit, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProfileService } from "@/services/data";

interface ProfileDropdownProps {
  profile?: {
    first_name: string | null;
    last_name: string | null;
    user_type: string;
    profile_photo_url?: string | null;
    profile_image_position?: any;
    quiz_completed?: boolean;
    email?: string;
  } | null;
}

export const ProfileDropdown = ({ profile }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  
  // Early return if profile is null or undefined
  if (!profile) {
    return null;
  }
  
  const getInitials = () => {
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = () => {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  };

  const handleResetPassword = async () => {
    try {
      // Get current user email
      const email = user?.email || profile?.email;
      
      if (!email) {
        toast({
          title: "Error",
          description: "No email found for current user.",
          variant: "destructive",
        });
        return;
      }

      const result = await ProfileService.resetPassword(email);
      
      if (result.success) {
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for instructions to reset your password.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to send password reset email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePreferences = () => {
    navigate('/client-survey');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // No toast needed - signOut() redirects immediately
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="Open user menu" title="Open user menu">
          <PositionedAvatar 
            src={profile.profile_photo_url || undefined}
            alt={getFullName()}
            fallback={getInitials()}
            position={profile.profile_image_position || { x: 50, y: 50, scale: 1 }}
            size="md"
            className="h-10 w-10"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <PositionedAvatar 
                src={profile.profile_photo_url || undefined}
                alt={getFullName()}
                fallback={getInitials()}
                position={profile.profile_image_position || { x: 50, y: 50, scale: 1 }}
                size="sm"
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  Welcome, {getFullName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {profile.user_type === 'client' ? 'Fitness Enthusiast' : 
                   profile.user_type === 'trainer' ? 'Personal Trainer' : 
                   'Administrator'}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="w-fit bg-primary/10 text-primary capitalize text-xs"
            >
              {profile.user_type}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {profile.user_type === 'trainer' && (
          <>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate(`/trainer/${user?.id || profile.first_name?.toLowerCase() || 'profile'}?from=dropdown`)}
            >
              <User className="mr-2 h-4 w-4" />
              <span>View Public Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/trainer/profile-setup')}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/trainer/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </>
        )}
        
        {profile.user_type === 'client' && (
          <>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={handleUpdatePreferences}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Edit Preferences</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/client/payments')}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Payments</span>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={handleResetPassword}
        >
          <Key className="mr-2 h-4 w-4" />
          <span>Reset Password</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};