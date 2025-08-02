import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Settings, LogOut } from "lucide-react";

interface ProfileDropdownProps {
  profile: {
    first_name: string | null;
    last_name: string | null;
    user_type: string;
    profile_photo_url?: string | null;
  };
  onSignOut: () => void;
}

export const ProfileDropdown = ({ profile, onSignOut }: ProfileDropdownProps) => {
  const getInitials = () => {
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = () => {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile.profile_photo_url || undefined} 
              alt={getFullName()} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={profile.profile_photo_url || undefined} 
                  alt={getFullName()} 
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
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
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};