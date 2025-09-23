import { Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type HighlightType = 'popular' | 'specialist' | null;

interface HighlightBadgeProps {
  type: HighlightType;
  className?: string;
}

export function HighlightBadge({ type, className }: HighlightBadgeProps) {
  if (!type) return null;

  const config = {
    popular: {
      icon: Crown,
      label: 'Popular',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
    },
    specialist: {
      icon: Sparkles, 
      label: 'Specialist',
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300'
    }
  };

  const { icon: Icon, label, className: badgeClassName } = config[type];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs px-2 py-0.5 h-5 flex items-center gap-1',
        badgeClassName,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}