import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Activity } from "lucide-react";
import { useTrainerActivities } from "@/hooks/useTrainerActivities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ActivityPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectActivity: (activityName: string, activityId?: string) => void;
  categoryFilter?: string;
  title?: string;
}

export function ActivityPickerDialog({
  open,
  onOpenChange,
  onSelectActivity,
  categoryFilter,
  title = "Select Activity"
}: ActivityPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [customActivityName, setCustomActivityName] = useState("");
  const { activities, loading, createActivity } = useTrainerActivities();

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || activity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const systemActivities = filteredActivities.filter(a => a.is_system);
  const customActivities = filteredActivities.filter(a => !a.is_system);

  const handleCreateCustomActivity = async () => {
    if (!customActivityName.trim()) return;

    try {
      const category = categoryFilter || 'general';
      await createActivity(customActivityName.trim(), category);
      onSelectActivity(customActivityName.trim());
      setCustomActivityName("");
      // Delayed close to reduce UI jumping
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    } catch (error) {
      console.error('Failed to create custom activity:', error);
    }
  };

  const handleSelectActivity = (activity: any) => {
    onSelectActivity(activity.activity_name, activity.id);
    // Don't close the dialog immediately to reduce UI jumping
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Create Custom Activity */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Create New Activity</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter activity name..."
                value={customActivityName}
                onChange={(e) => setCustomActivityName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCustomActivity()}
              />
              <Button 
                onClick={handleCreateCustomActivity}
                disabled={!customActivityName.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {/* System Activities */}
              {systemActivities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    System Activities
                    <Badge variant="secondary" className="text-xs">
                      {systemActivities.length}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {systemActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleSelectActivity(activity)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{activity.activity_name}</div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {systemActivities.length > 0 && customActivities.length > 0 && (
                <Separator />
              )}

              {/* Custom Activities */}
              {customActivities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    Your Custom Activities
                    <Badge variant="secondary" className="text-xs">
                      {customActivities.length}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {customActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleSelectActivity(activity)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{activity.activity_name}</div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredActivities.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activities found</p>
                  <p className="text-sm">Try adjusting your search or create a new activity</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}