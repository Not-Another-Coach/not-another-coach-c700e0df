import { User } from 'lucide-react';

interface ProfileLoadingStateProps {
  title?: string;
  subtitle?: string;
}

export function ProfileLoadingState({ 
  title = "Preparing your profile...",
  subtitle = "Setting up your workspace and loading your information."
}: ProfileLoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 animate-fade-in">
      <div className="text-center space-y-6 px-4 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <User className="h-16 w-16 text-primary/60" strokeWidth={1.5} />
            <div className="absolute inset-0 animate-pulse">
              <User className="h-16 w-16 text-primary/20" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
        
        {/* Shimmer bar */}
        <div className="w-48 h-1 mx-auto bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-shimmer"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
