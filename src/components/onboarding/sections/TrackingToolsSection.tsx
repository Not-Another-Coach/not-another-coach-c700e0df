import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  Clock, 
  Paperclip, 
  AlertCircle,
  CheckCircle,
  GripVertical,
  Download
} from 'lucide-react';
import { ActivityImporter } from '../ActivityImporter';
import { FirstWeekTask, useOnboardingSections } from '@/hooks/useOnboardingSections';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface TrackingToolsSectionProps {
  templateId: string;
  tasks: FirstWeekTask[];
  onTasksChange: () => void;
}

export function TrackingToolsSection({ templateId, tasks, onTasksChange }: TrackingToolsSectionProps) {
  const {
    // We'll reuse the first week task methods for now
    createFirstWeekTask,
    updateFirstWeekTask,
    deleteFirstWeekTask
  } = useOnboardingSections();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<FirstWeekTask | null>(null);
  const [newTask, setNewTask] = useState<Partial<FirstWeekTask>>({
    task_name: '',
    description: '',
    rich_guidance: '',
    is_mandatory: true,
    requires_attachment: false,
    attachment_types: ['file', 'photo', 'link'],
    max_attachments: 5,
    max_file_size_mb: 10,
    due_days: undefined,
    sla_hours: 24,
    display_order: 0
  });

  const handleCreateTask = async () => {
    if (!newTask.task_name?.trim()) {
      toast.error('Tool name is required');
      return;
    }

    try {
      await createFirstWeekTask(templateId, {
        ...newTask,
        display_order: tasks.length
      } as Omit<FirstWeekTask, 'id' | 'template_id'>);
      
      setNewTask({
        task_name: '',
        description: '',
        rich_guidance: '',
        is_mandatory: true,
        requires_attachment: false,
        attachment_types: ['file', 'photo', 'link'],
        max_attachments: 5,
        max_file_size_mb: 10,
        due_days: undefined,
        sla_hours: 24,
        display_order: 0
      });
      setShowCreateDialog(false);
      onTasksChange();
      toast.success('Tracking tool created successfully');
    } catch (error) {
      toast.error('Failed to create tracking tool');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.task_name?.trim()) {
      toast.error('Tool name is required');
      return;
    }

    try {
      await updateFirstWeekTask(editingTask.id, editingTask);
      setShowEditDialog(false);
      setEditingTask(null);
      onTasksChange();
      toast.success('Tracking tool updated successfully');
    } catch (error) {
      toast.error('Failed to update tracking tool');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteFirstWeekTask(taskId);
      onTasksChange();
      toast.success('Tracking tool deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tracking tool');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updates = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    try {
      await Promise.all(
        updates.map(item => updateFirstWeekTask(item.id, { display_order: item.display_order }))
      );
      onTasksChange();
      toast.success('Tracking tools reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder tracking tools');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tracking & Tools
          </CardTitle>
          <div className="flex gap-2">
            <ActivityImporter
              onImportActivities={async (activities) => {
                // Only import activities relevant to "Tracking & Tools"
                const relevantActivities = activities.filter(activity => 
                  activity.category === 'Tracking' || activity.category === 'Progress Monitoring'
                );
                
                for (const activity of relevantActivities) {
                  const newTaskData = {
                    task_name: activity.name,
                    description: activity.description || '',
                    is_mandatory: true,
                    due_days: activity.default_due_days || 7,
                    sla_hours: activity.default_sla_days ? activity.default_sla_days * 24 : 24,
                    activity_id: activity.id,
                    requires_attachment: false,
                    attachment_types: [] as string[],
                    max_attachments: 3,
                    max_file_size_mb: 10,
                    display_order: tasks.length + 1
                  };
                  
                  try {
                    await createFirstWeekTask(templateId, newTaskData as Omit<FirstWeekTask, 'id' | 'template_id'>);
                  } catch (error) {
                    console.error('Error creating tracking tool:', error);
                  }
                }
                
                if (relevantActivities.length === 0) {
                  toast.info('No "Tracking" or "Progress Monitoring" category activities selected.');
                } else {
                  toast.success(`Imported ${relevantActivities.length} tracking activities`);
                  onTasksChange();
                }
              }}
              defaultCategory="Tracking"
              trigger={
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Import Tracking Activities
                </Button>
              }
            />
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Tracking Tool</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tool Name</Label>
                      <Input
                        value={newTask.task_name || ''}
                        onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                        placeholder="e.g., Progress photos, Measurements tracking"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={newTask.is_mandatory}
                        onCheckedChange={(checked) => setNewTask({ ...newTask, is_mandatory: checked })}
                      />
                      <Label>Mandatory</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Brief description of the tracking tool or method..."
                    />
                  </div>

                  <div>
                    <Label>Rich Guidance (Optional)</Label>
                    <div className="mt-1">
                      <ReactQuill
                        value={newTask.rich_guidance || ''}
                        onChange={(value) => setNewTask({ ...newTask, rich_guidance: value })}
                        placeholder="Detailed instructions for using this tracking tool..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Due in Days (Optional)</Label>
                      <Input
                        type="number"
                        value={newTask.due_days || ''}
                        onChange={(e) => setNewTask({ ...newTask, due_days: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <Label>Response SLA (Hours)</Label>
                      <Input
                        type="number"
                        value={newTask.sla_hours || 24}
                        onChange={(e) => setNewTask({ ...newTask, sla_hours: parseInt(e.target.value) || 24 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newTask.requires_attachment}
                        onCheckedChange={(checked) => setNewTask({ ...newTask, requires_attachment: checked })}
                      />
                      <Label>Requires Attachments</Label>
                    </div>

                    {newTask.requires_attachment && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div>
                          <Label>Max Attachments</Label>
                          <Input
                            type="number"
                            value={newTask.max_attachments || 5}
                            onChange={(e) => setNewTask({ ...newTask, max_attachments: parseInt(e.target.value) || 5 })}
                          />
                        </div>
                        <div>
                          <Label>Max File Size (MB)</Label>
                          <Input
                            type="number"
                            value={newTask.max_file_size_mb || 10}
                            onChange={(e) => setNewTask({ ...newTask, max_file_size_mb: parseInt(e.target.value) || 10 })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask}>
                      Create Tool
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tracking tools configured yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add tools and methods for tracking client progress and results.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tracking-tools">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-1"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{task.task_name}</h4>
                                    <Badge variant={task.is_mandatory ? 'default' : 'secondary'}>
                                      {task.is_mandatory ? 'Required' : 'Optional'}
                                    </Badge>
                                    {task.requires_attachment && (
                                      <Badge variant="outline" className="gap-1">
                                        <Paperclip className="h-3 w-3" />
                                        Attachments
                                      </Badge>
                                    )}
                                    {task.due_days && (
                                      <Badge variant="outline" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {task.due_days} days
                                      </Badge>
                                    )}
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  )}
                                  {task.sla_hours && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      SLA: {task.sla_hours} hour response time
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingTask(task);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Edit Task Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tracking Tool</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tool Name</Label>
                    <Input
                      value={editingTask.task_name || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, task_name: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={editingTask.is_mandatory}
                      onCheckedChange={(checked) => setEditingTask({ ...editingTask, is_mandatory: checked })}
                    />
                    <Label>Mandatory</Label>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Rich Guidance (Optional)</Label>
                  <div className="mt-1">
                    <ReactQuill
                      value={editingTask.rich_guidance || ''}
                      onChange={(value) => setEditingTask({ ...editingTask, rich_guidance: value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due in Days (Optional)</Label>
                    <Input
                      type="number"
                      value={editingTask.due_days || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, due_days: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <Label>Response SLA (Hours)</Label>
                    <Input
                      type="number"
                      value={editingTask.sla_hours || 24}
                      onChange={(e) => setEditingTask({ ...editingTask, sla_hours: parseInt(e.target.value) || 24 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingTask.requires_attachment}
                      onCheckedChange={(checked) => setEditingTask({ ...editingTask, requires_attachment: checked })}
                    />
                    <Label>Requires Attachments</Label>
                  </div>

                  {editingTask.requires_attachment && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label>Max Attachments</Label>
                        <Input
                          type="number"
                          value={editingTask.max_attachments || 5}
                          onChange={(e) => setEditingTask({ ...editingTask, max_attachments: parseInt(e.target.value) || 5 })}
                        />
                      </div>
                      <div>
                        <Label>Max File Size (MB)</Label>
                        <Input
                          type="number"
                          value={editingTask.max_file_size_mb || 10}
                          onChange={(e) => setEditingTask({ ...editingTask, max_file_size_mb: parseInt(e.target.value) || 10 })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditTask}>
                    Update Tool
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}