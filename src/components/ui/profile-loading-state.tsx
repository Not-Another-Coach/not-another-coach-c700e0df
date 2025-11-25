import { Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProfileLoadingStateProps {
  title?: string;
  subtitle?: string;
}

const progressMessages = [
  "Syncing your details...",
  "Setting up your workspace...",
  "Loading your preferences...",
  "Almost there..."
];

export function ProfileLoadingState({ 
  title = "Preparing your profile...",
  subtitle = "Your coaching journey starts in a moment."
}: ProfileLoadingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % progressMessages.length);
        setFade(true);
      }, 300);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-secondary/5 animate-fade-in">
      <div className="text-center space-y-6 px-4 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-primary/30 animate-ring-pulse" />
            </div>
            
            {/* Middle pulsing ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-24 h-24 rounded-full border-2 border-secondary/30 animate-ring-pulse"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
            
            {/* Icon container with glow */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg shadow-primary/20">
              <Target 
                className="h-10 w-10 text-primary" 
                strokeWidth={1.5}
              />
              {/* Subtle glow layer */}
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
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
        
        {/* Enhanced shimmer bar with gradient */}
        <div className="w-48 h-1 mx-auto bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-primary/70 via-secondary/70 to-transparent animate-shimmer"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Rotating progress messages */}
        <div className="h-6 flex items-center justify-center">
          <p 
            className={`text-xs text-muted-foreground transition-opacity duration-300 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {progressMessages[currentMessageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
