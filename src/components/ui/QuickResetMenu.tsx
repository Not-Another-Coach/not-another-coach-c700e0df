import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserIntent } from "@/hooks/useUserIntent";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { RefreshCw, RotateCcw, Trash2, Settings, ChevronDown } from "lucide-react";

interface QuickResetMenuProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  className?: string;
}

export const QuickResetMenu = ({ 
  variant = "ghost", 
  size = "sm", 
  children,
  className 
}: QuickResetMenuProps) => {
  const { clearIntent, resetIntentAndCreateNewSession, userIntent } = useUserIntent();
  const { session } = useAnonymousSession();

  const hasSavedData = session && (
    (session.savedTrainers && session.savedTrainers.length > 0) || 
    session.quizResults
  );

  const handleIntentOnlyReset = () => {
    clearIntent();
  };

  const handleCompleteReset = () => {
    resetIntentAndCreateNewSession();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {children || (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Options
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">
          Current: {userIntent ? `Looking as ${userIntent}` : "No intent set"}
        </DropdownMenuLabel>
        
        {hasSavedData && (
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {session?.savedTrainers?.length || 0} saved • {session?.quizResults ? 'Quiz done' : 'No quiz'}
          </DropdownMenuLabel>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleIntentOnlyReset} className="text-sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          <div>
            <div>Change Intent Only</div>
            <div className="text-xs text-muted-foreground">Keep saved data</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleCompleteReset} 
          className="text-sm text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <div>
            <div>Start Fresh</div>
            <div className="text-xs text-muted-foreground">Clear everything</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};