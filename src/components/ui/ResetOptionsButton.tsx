import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResetOptionsModal } from "./ResetOptionsModal";
import { RefreshCw } from "lucide-react";

interface ResetOptionsButtonProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  className?: string;
}

export const ResetOptionsButton = ({ 
  variant = "outline", 
  size = "sm", 
  children,
  className 
}: ResetOptionsButtonProps) => {
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowResetModal(true)}
        variant={variant}
        size={size}
        className={className}
      >
        {children || (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Options
          </>
        )}
      </Button>
      
      <ResetOptionsModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      />
    </>
  );
};