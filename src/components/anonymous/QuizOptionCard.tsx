import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuizOptionCardProps {
  option: {
    value: string;
    label: string;
    description?: string;
    icon?: React.ComponentType<any>;
  };
  isSelected: boolean;
  onSelect: () => void;
  type: 'single' | 'multiple' | 'location_input';
}

export const QuizOptionCard = ({ option, isSelected, onSelect, type }: QuizOptionCardProps) => {
  const Icon = option.icon;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
        isSelected
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-border hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      {/* Selection indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
        isSelected 
          ? "border-primary bg-primary text-primary-foreground" 
          : "border-muted-foreground/30"
      )}>
        {isSelected && <Check className="w-3 h-3" />}
      </div>

      {/* Icon */}
      {Icon && (
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors duration-200",
          isSelected 
            ? "bg-primary text-primary-foreground" 
            : "bg-accent text-accent-foreground"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      )}

      {/* Content */}
      <div>
        <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
        {option.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {option.description}
          </p>
        )}
      </div>
    </div>
  );
};