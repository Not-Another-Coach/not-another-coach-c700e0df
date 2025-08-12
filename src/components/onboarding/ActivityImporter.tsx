import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Download } from 'lucide-react';
import { useTrainerActivities } from '@/hooks/useTrainerActivities';
import { toast } from 'sonner';

interface ActivityImporterProps {
  onImportActivities: (activities: { 
    id: string; 
    name: string; 
    category: string; 
    description?: string;
    guidance_html?: string;
    default_due_days?: number;
    default_sla_days?: number;
  }[]) => void;
  trigger?: React.ReactNode;
}

export function ActivityImporter({ onImportActivities, trigger }: ActivityImporterProps) {
  const { activities, loading } = useTrainerActivities();
  const [open, setOpen] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Array.from(new Set(activities.map(a => a.category))).sort();
  
  const filteredActivities = activities.filter(activity => {
    if (categoryFilter !== 'all' && activity.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return activity.activity_name.toLowerCase().includes(term) ||
             (activity.description || '').toLowerCase().includes(term);
    }
    return true;
  });

  const handleSelectActivity = (activityId: string, checked: boolean) => {
    setSelectedActivities(prev => 
      checked 
        ? [...prev, activityId]
        : prev.filter(id => id !== activityId)
    );
  };

  const handleImport = () => {
    const selectedActivityData = activities
      .filter(a => selectedActivities.includes(a.id))
      .map(a => ({
        id: a.id,
        name: a.activity_name,
        category: a.category,
        description: a.description || '',
        guidance_html: a.guidance_html || '',
        default_due_days: a.default_due_days || undefined,
        default_sla_days: a.default_sla_days || undefined
      }));

    onImportActivities(selectedActivityData);
    setSelectedActivities([]);
    setOpen(false);
    toast.success(`Imported ${selectedActivityData.length} activities`);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Import Activities
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Activities</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Search</Label>
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedActivities.length} of {filteredActivities.length} activities selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedActivities(filteredActivities.map(a => a.id))}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedActivities([])}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Activities List */}
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading activities...
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities found matching your criteria.
              </div>
            ) : (
              filteredActivities.map(activity => (
                <Card key={activity.id} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedActivities.includes(activity.id)}
                        onCheckedChange={(checked) => 
                          handleSelectActivity(activity.id, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium truncate">{activity.activity_name}</h4>
                          <Badge variant="outline" className="shrink-0">
                            {activity.category}
                          </Badge>
                          {activity.is_system && (
                            <Badge variant="secondary" className="shrink-0">
                              System
                            </Badge>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {activity.default_due_days && (
                            <span>Due: {activity.default_due_days} days</span>
                          )}
                          {activity.default_sla_days && (
                            <span>SLA: {activity.default_sla_days} days</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedActivities.length === 0}
            >
              Import {selectedActivities.length} Activities
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}