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
import { RotateCcw, Settings, ChevronDown } from "lucide-react";

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
  const { clearIntent, userIntent } = useUserIntent();

  const handleIntentOnlyReset = () => {
    clearIntent();
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
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleIntentOnlyReset} className="text-sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          <div>
            <div>Change Intent</div>
            <div className="text-xs text-muted-foreground">Reset selection</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
