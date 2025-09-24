import { Loader2, User, CheckCircle, Database, Settings, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MigrationLoaderProps {
  migrationState: 'idle' | 'preparing' | 'migrating-data' | 'updating-profile' | 'finalizing' | 'completed';
  migrationProgress: number;
  migrationMessage: string;
  className?: string;
}

const stateIcons = {
  idle: Loader2,
  preparing: Database,
  'migrating-data': Sparkles,
  'updating-profile': User,
  finalizing: Settings,
  completed: CheckCircle,
};

const stateColors = {
  idle: "text-muted-foreground",
  preparing: "text-blue-500",
  'migrating-data': "text-purple-500",
  'updating-profile': "text-green-500",
  finalizing: "text-orange-500",
  completed: "text-success",
};

export function MigrationLoader({ 
  migrationState, 
  migrationProgress, 
  migrationMessage,
  className 
}: MigrationLoaderProps) {
  const IconComponent = stateIcons[migrationState];
  const iconColor = stateColors[migrationState];
  
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background", className)}>
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                <IconComponent 
                  className={cn(
                    "w-8 h-8 transition-colors duration-300",
                    iconColor,
                    migrationState !== 'completed' && "animate-pulse"
                  )}
                />
              </div>
              
              {/* Animated ring for active states */}
              {migrationState !== 'idle' && migrationState !== 'completed' && (
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              )}
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {migrationState === 'completed' ? 'Welcome!' : 'Setting up your profile'}
              </h2>
              
              {/* Message */}
              <p className="text-muted-foreground text-sm">
                {migrationMessage || 'Please wait while we prepare your experience...'}
              </p>
            </div>
            
            {/* Progress Bar */}
            {migrationState !== 'completed' && (
              <div className="w-full space-y-2">
                <Progress 
                  value={migrationProgress} 
                  className="w-full h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{migrationProgress}%</span>
                </div>
              </div>
            )}
            
            {/* Success State */}
            {migrationState === 'completed' && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Your data has been synced successfully!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}