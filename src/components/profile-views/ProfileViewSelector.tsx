import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Trophy, BookOpen, Play, GitCompare, ChevronDown, Grid3X3 } from 'lucide-react';

export type ProfileViewMode = 'overview' | 'results' | 'story' | 'content' | 'cards' | 'compare';

interface ProfileViewSelectorProps {
  currentView: ProfileViewMode;
  onViewChange: (view: ProfileViewMode) => void;
  compareCount?: number;
  isMobile?: boolean;
  hideCardsView?: boolean;
  hideCompareView?: boolean;
  hideDescriptions?: boolean;
  hideViewingBadge?: boolean;
}

const viewOptions = [
  {
    value: 'overview' as ProfileViewMode,
    label: 'Overview',
    icon: Eye,
    description: 'Brief summary of coach'
  },
  {
    value: 'results' as ProfileViewMode,
    label: 'Results',
    icon: Trophy,
    description: 'Before/after images, progress stats'
  },
  {
    value: 'story' as ProfileViewMode,
    label: 'Story',
    icon: BookOpen,
    description: 'Testimonials, reviews, background'
  },
  {
    value: 'cards' as ProfileViewMode,
    label: 'Card Views',
    icon: Grid3X3,
    description: 'How your profile appears as cards'
  },
  {
    value: 'compare' as ProfileViewMode,
    label: 'Compare',
    icon: GitCompare,
    description: 'Side-by-side comparison'
  }
];

export const ProfileViewSelector = ({ 
  currentView, 
  onViewChange, 
  compareCount = 0,
  isMobile = false,
  hideCardsView = false,
  hideCompareView = false,
  hideDescriptions = false,
  hideViewingBadge = false
}: ProfileViewSelectorProps) => {
  let filteredViewOptions = viewOptions;
  
  if (hideCardsView) {
    filteredViewOptions = filteredViewOptions.filter(option => option.value !== 'cards');
  }
  
  if (hideCompareView) {
    filteredViewOptions = filteredViewOptions.filter(option => option.value !== 'compare');
  }
  
  const currentOption = filteredViewOptions.find(option => option.value === currentView);

  if (isMobile) {
    // Mobile: Dropdown menu
    return (
      <div className="space-y-2">
        {!hideViewingBadge && (
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Viewing: {currentOption?.label}
            </Badge>
            {currentView === 'compare' && compareCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {compareCount} selected
              </Badge>
            )}
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                {currentOption?.icon && <currentOption.icon className="w-4 h-4" />}
                <span>{currentOption?.label}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-64">
            {filteredViewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onViewChange(option.value)}
                  className="flex flex-col items-start p-3"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{option.label}</span>
                    {option.value === 'compare' && compareCount > 0 && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {compareCount}
                      </Badge>
                    )}
                  </div>
                  {!hideDescriptions && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Desktop: Tabs
  return (
    <div className="space-y-2">
      {!hideViewingBadge && (
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm">
            Viewing: {currentOption?.label}
          </Badge>
          {currentView === 'compare' && compareCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {compareCount} selected for comparison
            </Badge>
          )}
        </div>
      )}
      
      <Tabs value={currentView} onValueChange={(value) => onViewChange(value as ProfileViewMode)}>
        <TabsList className={`grid w-full h-auto p-1 ${
          filteredViewOptions.length === 3 ? 'grid-cols-3' :
          filteredViewOptions.length === 4 ? 'grid-cols-4' :
          filteredViewOptions.length === 5 ? 'grid-cols-5' :
          'grid-cols-6'
        }`}>
          {filteredViewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="flex flex-col items-center p-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{option.label}</span>
                {option.value === 'compare' && compareCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] mt-1 px-1 py-0">
                    {compareCount}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      
      {!hideDescriptions && currentOption && (
        <p className="text-sm text-muted-foreground text-center">
          {currentOption.description}
        </p>
      )}
    </div>
  );
};