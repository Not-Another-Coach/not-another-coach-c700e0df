import { Button } from "@/components/ui/button";
import { Grid3X3, List, Trophy } from "lucide-react";
import { TrainerCardViewMode } from '@/types/trainer';

interface TrainerCardViewSelectorProps {
  currentView: TrainerCardViewMode;
  onViewChange: (view: TrainerCardViewMode) => void;
  className?: string;
}

export const TrainerCardViewSelector = ({ 
  currentView, 
  onViewChange, 
  className 
}: TrainerCardViewSelectorProps) => {
  const views = [
    {
      id: 'instagram' as const,
      label: 'Gallery',
      icon: Grid3X3,
      description: 'Instagram & Media'
    },
    {
      id: 'features' as const,
      label: 'Features',
      icon: List,
      description: 'Specialisations'
    },
    {
      id: 'transformations' as const,
      label: 'Results',
      icon: Trophy,
      description: 'Transformations'
    }
  ];

  return (
    <div className={`flex rounded-lg bg-muted p-1 ${className}`}>
      {views.map((view) => {
        const IconComponent = view.icon;
        return (
          <Button
            key={view.id}
            variant={currentView === view.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(view.id)}
            className="flex-1 flex items-center gap-2 px-3 py-2 text-xs"
          >
            <IconComponent className="h-3 w-3" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
};