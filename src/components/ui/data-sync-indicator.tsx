import { Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSyncIndicatorProps {
  isLoading?: boolean;
  isRefreshing?: boolean;
  isConnected?: boolean;
  className?: string;
}

export function DataSyncIndicator({ 
  isLoading = false, 
  isRefreshing = false, 
  isConnected = true,
  className 
}: DataSyncIndicatorProps) {
  if (isRefreshing) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Syncing data...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <WifiOff className="h-4 w-4" />
        <span>Connection lost</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm text-success", className)}>
      <Wifi className="h-4 w-4" />
      <span>Data synced</span>
    </div>
  );
}