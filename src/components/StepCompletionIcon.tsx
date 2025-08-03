import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCompletionIconProps {
  isCompleted: boolean;
  isPartial?: boolean;
  className?: string;
}

export const StepCompletionIcon = ({ 
  isCompleted, 
  isPartial = false, 
  className 
}: StepCompletionIconProps) => {
  if (isCompleted) {
    return (
      <CheckCircle 
        className={cn("h-4 w-4 text-green-600", className)} 
      />
    );
  }
  
  if (isPartial) {
    return (
      <AlertCircle 
        className={cn("h-4 w-4 text-amber-500", className)} 
      />
    );
  }
  
  return (
    <Circle 
      className={cn("h-4 w-4 text-muted-foreground", className)} 
    />
  );
};