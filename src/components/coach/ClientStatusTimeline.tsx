import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientStatusTimelineProps {
  currentStage: string;
  hasDiscoveryCall: boolean;
  hasPackageRequest: boolean;
  paymentStatus?: string;
  isActive?: boolean;
}

export const ClientStatusTimeline = ({
  currentStage,
  hasDiscoveryCall,
  hasPackageRequest,
  paymentStatus,
  isActive = false,
}: ClientStatusTimelineProps) => {
  // Determine which stages are completed
  const discoveryComplete = hasDiscoveryCall || 
    ['matched', 'discovery_completed', 'active_client'].includes(currentStage);
  
  const packageRequested = hasPackageRequest || 
    paymentStatus === 'awaiting_payment' || 
    paymentStatus === 'accepted' || 
    isActive;
  
  const paymentComplete = paymentStatus === 'accepted' || isActive;
  
  const activeClient = isActive || currentStage === 'active_client';

  // Determine current active stage for highlighting
  const getCurrentStage = () => {
    if (activeClient) return 'active';
    if (paymentStatus === 'awaiting_payment') return 'payment';
    if (packageRequested) return 'package';
    if (discoveryComplete) return 'discovery';
    return 'none';
  };

  const currentActiveStage = getCurrentStage();

  const stages = [
    { 
      key: 'discovery', 
      label: 'Discovery Call', 
      complete: discoveryComplete,
      active: currentActiveStage === 'discovery'
    },
    { 
      key: 'package', 
      label: 'Package Requested', 
      complete: packageRequested,
      active: currentActiveStage === 'package'
    },
    { 
      key: 'payment', 
      label: 'Awaiting Payment', 
      complete: paymentComplete,
      active: currentActiveStage === 'payment'
    },
    { 
      key: 'active', 
      label: 'Active Client', 
      complete: activeClient,
      active: currentActiveStage === 'active'
    },
  ];

  return (
    <div className="flex items-center gap-0.5 my-2 overflow-x-auto pb-1">
      {stages.map((stage, index) => (
        <div key={stage.key} className="flex items-center min-w-fit">
          {/* Stage Circle */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {stage.complete ? (
              <CheckCircle2 
                className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0",
                  stage.active ? "text-primary" : "text-muted-foreground"
                )} 
              />
            ) : (
              <Circle 
                className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0",
                  stage.active ? "text-primary fill-primary/20" : "text-muted-foreground/40"
                )} 
              />
            )}
            <span 
              className={cn(
                "text-[10px] sm:text-xs whitespace-nowrap",
                stage.complete && stage.active && "font-medium text-primary",
                stage.complete && !stage.active && "text-muted-foreground",
                !stage.complete && stage.active && "font-medium text-primary",
                !stage.complete && !stage.active && "text-muted-foreground/60"
              )}
            >
              {stage.label}
            </span>
          </div>

          {/* Connecting Line */}
          {index < stages.length - 1 && (
            <div 
              className={cn(
                "h-px w-2 sm:w-4 mx-0.5 sm:mx-1 flex-shrink-0",
                stage.complete ? "bg-muted-foreground/30" : "bg-muted-foreground/10"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
