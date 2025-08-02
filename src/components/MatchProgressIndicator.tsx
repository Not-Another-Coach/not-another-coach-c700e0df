import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchProgressIndicatorProps {
  matchScore: number;
  matchReasons?: string[];
  isShortlisted?: boolean;
  hasContacted?: boolean;
  hasScheduledCall?: boolean;
  className?: string;
}

export const MatchProgressIndicator = ({
  matchScore,
  matchReasons = [],
  isShortlisted = false,
  hasContacted = false,
  hasScheduledCall = false,
  className
}: MatchProgressIndicatorProps) => {
  
  const getMatchLevel = (score: number) => {
    if (score >= 90) return { level: 'Perfect', color: 'from-green-500 to-emerald-500', icon: '🎯' };
    if (score >= 80) return { level: 'Excellent', color: 'from-blue-500 to-cyan-500', icon: '⭐' };
    if (score >= 70) return { level: 'Good', color: 'from-purple-500 to-pink-500', icon: '👍' };
    if (score >= 60) return { level: 'Fair', color: 'from-orange-500 to-yellow-500', icon: '👌' };
    return { level: 'Poor', color: 'from-gray-500 to-slate-500', icon: '🤔' };
  };

  const match = getMatchLevel(matchScore);
  
  const connectionSteps = [
    { 
      key: 'matched', 
      label: 'Matched', 
      completed: matchScore > 0, 
      icon: CheckCircle2,
      description: `${matchScore}% match`
    },
    { 
      key: 'shortlisted', 
      label: 'Shortlisted', 
      completed: isShortlisted, 
      icon: CheckCircle2,
      description: 'Saved to favorites'
    },
    { 
      key: 'contacted', 
      label: 'Contacted', 
      completed: hasContacted, 
      icon: hasContacted ? CheckCircle2 : Clock,
      description: hasContacted ? 'Message sent' : 'Send message'
    },
    { 
      key: 'call', 
      label: 'Discovery Call', 
      completed: hasScheduledCall, 
      icon: hasScheduledCall ? CheckCircle2 : Clock,
      description: hasScheduledCall ? 'Call scheduled' : 'Schedule call'
    }
  ];

  const completedSteps = connectionSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / connectionSteps.length) * 100;

  return (
    <Card className={cn("bg-white/50 backdrop-blur border-0 shadow-sm", className)}>
      <CardContent className="p-3">
        {/* Match Score Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center text-xs",
              match.color
            )}>
              <span className="text-white font-bold">{match.icon}</span>
            </div>
            <div>
              <div className="font-semibold text-sm">{matchScore}% Match</div>
              <div className="text-xs text-muted-foreground">{match.level} fit</div>
            </div>
          </div>
          
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              completedSteps === 4 ? "bg-green-100 text-green-800" : "bg-primary/10 text-primary"
            )}
          >
            {completedSteps}/4 steps
          </Badge>
        </div>

        {/* Connection Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Connection Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          
          <div className="flex gap-1">
            {connectionSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex-1 h-1.5 rounded-full transition-colors",
                    step.completed 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                      : "bg-muted"
                  )}
                />
              );
            })}
          </div>

          {/* Steps List */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            {connectionSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex items-center gap-1 text-xs p-1 rounded",
                    step.completed 
                      ? "text-green-700 bg-green-50" 
                      : "text-muted-foreground bg-muted/30"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span className="truncate">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Reasons */}
        {matchReasons.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Why this match:</div>
            <div className="flex flex-wrap gap-1">
              {matchReasons.slice(0, 3).map((reason, index) => (
                <span 
                  key={index}
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                >
                  {reason}
                </span>
              ))}
              {matchReasons.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{matchReasons.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Next Action */}
        {!hasScheduledCall && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-primary">
              <Zap className="h-3 w-3" />
              <span className="font-medium">
                {!isShortlisted ? "Save to shortlist" :
                 !hasContacted ? "Send message" :
                 !hasScheduledCall ? "Schedule discovery call" :
                 "Book trial session"}
              </span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};