import { Badge } from "@/components/ui/badge";
import { Heart, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  score: number;
  reasons: string[];
  className?: string;
}

export const MatchBadge = ({ score, reasons, className }: MatchBadgeProps) => {
  if (score === 0) return null;

  const getMatchLevel = (score: number) => {
    if (score >= 80) return { label: "Perfect Match", color: "bg-green-500", icon: Heart };
    if (score >= 60) return { label: "Great Match", color: "bg-blue-500", icon: Star };
    if (score >= 40) return { label: "Good Match", color: "bg-purple-500", icon: Target };
    return { label: "Potential Match", color: "bg-gray-500", icon: Target };
  };

  const match = getMatchLevel(score);
  const Icon = match.icon;

  return (
    <div className={cn("space-y-1", className)}>
      <Badge 
        variant="secondary" 
        className={cn(
          "text-white border-0 font-medium",
          match.color
        )}
      >
        <Icon className="w-3 h-3 mr-1" />
        {match.label} ({score}%)
      </Badge>
      {reasons.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {reasons.slice(0, 2).join(" • ")}
          {reasons.length > 2 && " • ..."}
        </div>
      )}
    </div>
  );
};