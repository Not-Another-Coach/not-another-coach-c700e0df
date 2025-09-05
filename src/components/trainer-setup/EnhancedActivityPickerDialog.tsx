import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Activity } from "lucide-react";
import { useTrainerActivities } from "@/hooks/useTrainerActivities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SelectedActivity {
  id?: string;
  name: string;
  category: string;
  isCustom: boolean;
}

interface EnhancedActivityPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectActivity: (activity: SelectedActivity) => void;
  selectedActivities: SelectedActivity[];
  categoryFilter?: string[];
  title?: string;
  sectionKey: string;
}

export function EnhancedActivityPickerDialog({
  open,
  onOpenChange,
  onSelectActivity,
  selectedActivities,
  categoryFilter,
  title = "Select Activities",
  sectionKey
}: EnhancedActivityPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [customActivityName, setCustomActivityName] = useState("");
  const { activities, loading, createActivity, refresh } = useTrainerActivities();

  // Fetch activities when dialog opens
  React.useEffect(() => {
    if (open) {
      console.log("Dialog opened, activities count:", activities.length);
      if (activities.length === 0) {
        refresh();
      }
    }
  }, [open, refresh, activities.length]);

  const selectedActivityNames = selectedActivities.map(a => a.name.toLowerCase());

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter.length === 0 || categoryFilter.includes(activity.category);
    const notAlreadySelected = !selectedActivityNames.includes(activity.activity_name.toLowerCase());
    return matchesSearch && matchesCategory && notAlreadySelected;
  });

  React.useEffect(() => {
    console.log("Activity filtering:");
    console.log("- Total activities:", activities.length);
    console.log("- Category filter:", categoryFilter);
    console.log("- Search:", search);
    console.log("- Selected activities:", selectedActivities.length);
    console.log("- Filtered activities:", filteredActivities.length);
    console.log("- System activities in filtered:", filteredActivities.filter(a => a.is_system).length);
  }, [activities, categoryFilter, search, selectedActivities, filteredActivities]);

  const systemActivities = filteredActivities.filter(a => a.is_system);
  const customActivities = filteredActivities.filter(a => !a.is_system);

  const handleCreateCustomActivity = async () => {
    if (!customActivityName.trim()) return;
    
    // Check for duplicates in selected activities
    if (selectedActivityNames.includes(customActivityName.trim().toLowerCase())) {
      return; // Don't create duplicate
    }

    try {
      const category = (categoryFilter && categoryFilter.length > 0) ? categoryFilter[0] : 'general';
      await createActivity(customActivityName.trim(), category);
      
      const newActivity: SelectedActivity = {
        name: customActivityName.trim(),
        category,
        isCustom: true
      };
      
      onSelectActivity(newActivity);
      setCustomActivityName("");
      
      // Refresh activities to get the newly created one
      refresh();
    } catch (error) {
      console.error('Failed to create custom activity:', error);
    }
  };

  const handleSelectActivity = (activity: any) => {
    const selectedActivity: SelectedActivity = {
      id: activity.id,
      name: activity.activity_name,
      category: activity.category,
      isCustom: !activity.is_system
    };
    
    onSelectActivity(selectedActivity);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Choose from suggested activities or create your own custom activities for {sectionKey}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Currently Selected Activities */}
          {selectedActivities.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-2">Currently Selected ({selectedActivities.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedActivities.map((activity, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {activity.name}
                    {activity.isCustom && <span className="ml-1 text-xs opacity-70">(Custom)</span>}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search activities for ${sectionKey}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Create Custom Activity */}
          <div className="p-4 border rounded-lg bg-accent/30">
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
                disabled={!customActivityName.trim() || selectedActivityNames.includes(customActivityName.trim().toLowerCase())}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {selectedActivityNames.includes(customActivityName.trim().toLowerCase()) && (
              <p className="text-sm text-destructive mt-1">Activity already selected</p>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading activities...</p>
                </div>
              )}

              {!loading && filteredActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activities found</p>
                  <p className="text-sm">Try adjusting your search or create a new activity</p>
                </div>
              )}

              {/* System Activities */}
              {!loading && systemActivities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    Suggested Activities
                    <Badge variant="secondary" className="text-xs">
                      {systemActivities.length}
                    </Badge>
                  </h4>
                  <div className="grid gap-2">
                    {systemActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                        onClick={() => handleSelectActivity(activity)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium group-hover:text-primary transition-colors">
                              {activity.activity_name}
                            </div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs ml-2">
                            {activity.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && systemActivities.length > 0 && customActivities.length > 0 && (
                <Separator />
              )}

              {/* Custom Activities */}
              {!loading && customActivities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    Your Custom Activities
                    <Badge variant="secondary" className="text-xs">
                      {customActivities.length}
                    </Badge>
                  </h4>
                  <div className="grid gap-2">
                    {customActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                        onClick={() => handleSelectActivity(activity)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium group-hover:text-primary transition-colors">
                              {activity.activity_name}
                            </div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {activity.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}