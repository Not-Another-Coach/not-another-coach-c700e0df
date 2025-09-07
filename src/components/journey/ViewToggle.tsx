import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart3, Columns3 } from 'lucide-react';
import { ViewMode } from '@/types/journey';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-3 bg-card p-2 rounded-lg border">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="view-toggle" className="text-sm font-medium">
          Funnel
        </Label>
      </div>
      
      <Switch
        id="view-toggle"
        checked={viewMode === 'kanban'}
        onCheckedChange={(checked) => 
          onViewModeChange(checked ? 'kanban' : 'funnel')
        }
      />
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="view-toggle" className="text-sm font-medium">
          Kanban
        </Label>
        <Columns3 className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}