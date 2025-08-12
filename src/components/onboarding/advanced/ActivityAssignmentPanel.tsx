import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Clock,
  Target,
  FileText
} from 'lucide-react';
import { useAdvancedOnboarding, ActivityAssignment } from '@/hooks/useAdvancedOnboarding';
import { useTrainerOnboarding } from '@/hooks/useTrainerOnboarding';
import { toast } from 'sonner';

interface ActivityAssignmentPanelProps {
  templateId: string;
  sectionType: 'getting_started' | 'ongoing_support' | 'commitments' | 'trainer_notes';
  sectionItemId: string;
  sectionItemName: string;
}

export function ActivityAssignmentPanel({
  templateId,
  sectionType,
  sectionItemId,
  sectionItemName
}: ActivityAssignmentPanelProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [isRequired, setIsRequired] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const {
    activityAssignments,
    fetchActivityAssignments,
    assignActivityToSection,
    removeActivityAssignment,
    reorderActivityAssignments,
    loading
  } = useAdvancedOnboarding();
  
  // Mock activities for now - in a real implementation, this would come from a proper activities hook
  const activities = [];

  // Filter assignments for this specific section item
  const sectionAssignments = activityAssignments.filter(
    assignment => assignment.section_item_id === sectionItemId
  );

  useEffect(() => {
    fetchActivityAssignments(templateId);
  }, [templateId, fetchActivityAssignments]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sectionAssignments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedAssignments = items.map((item, index) => ({
      ...item,
      assignment_order: index
    }));

    try {
      await reorderActivityAssignments(reorderedAssignments);
    } catch (error) {
      toast.error('Failed to reorder activities');
    }
  };

  const handleAssignActivity = async () => {
    if (!selectedActivityId) {
      toast.error('Please select an activity');
      return;
    }

    try {
      await assignActivityToSection(
        templateId,
        sectionType,
        sectionItemId,
        selectedActivityId,
        isRequired,
        customInstructions || undefined
      );
      
      setShowAssignDialog(false);
      setSelectedActivityId('');
      setCustomInstructions('');
      setIsRequired(true);
      toast.success('Activity assigned successfully');
    } catch (error) {
      toast.error('Failed to assign activity');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await removeActivityAssignment(assignmentId, templateId);
    } catch (error) {
      toast.error('Failed to remove activity assignment');
    }
  };

  const getActivityName = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    return activity?.activity_name || 'Unknown Activity';
  };

  const getActivityCategory = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    return activity?.category || 'General';
  };

  // Filter out already assigned activities
  const availableActivities = activities.filter(
    activity => !sectionAssignments.some(assignment => assignment.activity_id === activity.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Assigned Activities for "{sectionItemName}"
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAssignDialog(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Assign Activity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sectionAssignments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activities assigned yet. Click "Assign Activity" to get started.
          </p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="section-activities">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {sectionAssignments.map((assignment, index) => (
                    <Draggable
                      key={assignment.id}
                      draggableId={assignment.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg p-3 bg-background ${
                            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="text-muted-foreground hover:text-foreground cursor-grab"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">
                                    {getActivityName(assignment.activity_id)}
                                  </h4>
                                  <Badge variant={assignment.is_required ? 'default' : 'secondary'}>
                                    {assignment.is_required ? 'Required' : 'Optional'}
                                  </Badge>
                                  <Badge variant="outline">
                                    {getActivityCategory(assignment.activity_id)}
                                  </Badge>
                                </div>
                                {assignment.custom_instructions && (
                                  <p className="text-xs text-muted-foreground">
                                    {assignment.custom_instructions}
                                  </p>
                                )}
                                {assignment.estimated_duration_minutes && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      ~{assignment.estimated_duration_minutes} min
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAssignment(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Assign Activity Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Activity to "{sectionItemName}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Activity</Label>
                <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an activity from your library" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActivities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        <div className="flex items-center gap-2">
                          <span>{activity.activity_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={isRequired}
                  onCheckedChange={setIsRequired}
                />
                <Label htmlFor="required">Required Activity</Label>
              </div>

              <div>
                <Label>Custom Instructions (Optional)</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Add specific instructions for this activity assignment..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignActivity} disabled={!selectedActivityId}>
                  Assign Activity
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}