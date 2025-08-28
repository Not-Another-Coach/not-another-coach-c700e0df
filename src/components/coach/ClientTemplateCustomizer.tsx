import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  Users,
  MessageSquare
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomTask {
  id?: string;
  task_name: string;
  description: string;
  instructions: string;
  is_mandatory: boolean;
  requires_attachment: boolean;
  due_days?: number;
  display_order: number;
  check_in_frequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'none';
  check_in_notes?: string;
  section_type: 'getting_started' | 'first_week' | 'ongoing_support' | 'commitments';
}

interface ClientTemplateCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  clientId: string;
  clientName: string;
  onAssignmentComplete?: () => void;
}

export function ClientTemplateCustomizer({
  isOpen,
  onClose,
  templateId,
  templateName,
  clientId,
  clientName,
  onAssignmentComplete
}: ClientTemplateCustomizerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('getting_started');
  const [customizedName, setCustomizedName] = useState(templateName);
  const [tasks, setTasks] = useState<CustomTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingAssignment, setProcessingAssignment] = useState(false);

  // Load original template data when dialog opens
  useEffect(() => {
    if (isOpen && templateId) {
      loadTemplateData();
    }
  }, [isOpen, templateId]);

  const loadTemplateData = async () => {
    setLoading(true);
    try {
      // First, check if this template has sections data
      const [gettingStartedRes, firstWeekRes, ongoingSupportRes, commitmentsRes] = await Promise.all([
        supabase.from('onboarding_getting_started').select('*').eq('template_id', templateId).order('display_order'),
        supabase.from('onboarding_first_week').select('*').eq('template_id', templateId).order('display_order'),
        supabase.from('onboarding_ongoing_support').select('*').eq('template_id', templateId),
        supabase.from('onboarding_commitments').select('*').eq('template_id', templateId).order('display_order')
      ]);

      const allTasks: CustomTask[] = [];

      // Load Getting Started tasks
      if (gettingStartedRes.data && gettingStartedRes.data.length > 0) {
        allTasks.push(...gettingStartedRes.data.map(task => ({
          id: task.id,
          task_name: task.task_name || 'Getting Started Task',
          description: task.description || '',
          instructions: task.rich_guidance || '',
          is_mandatory: task.is_mandatory ?? true,
          requires_attachment: task.requires_attachment ?? false,
          due_days: task.due_days,
          display_order: task.display_order || 0,
          section_type: 'getting_started' as const
        })));
      }

      // Load First Week tasks
      if (firstWeekRes.data && firstWeekRes.data.length > 0) {
        allTasks.push(...firstWeekRes.data.map(task => ({
          id: task.id,
          task_name: task.task_name || 'First Week Task',
          description: task.description || '',
          instructions: task.rich_guidance || '',
          is_mandatory: task.is_mandatory ?? true,
          requires_attachment: task.requires_attachment ?? false,
          due_days: task.due_days,
          display_order: task.display_order || 0,
          section_type: 'first_week' as const
        })));
      }

      // Load Ongoing Support tasks
      if (ongoingSupportRes.data && ongoingSupportRes.data.length > 0) {
        allTasks.push(...ongoingSupportRes.data.map((task, index) => ({
          id: task.id,
          task_name: task.check_in_frequency ? `${task.check_in_frequency.charAt(0).toUpperCase() + task.check_in_frequency.slice(1)} Check-in` : 'Ongoing Support',
          description: task.client_response_expectations || 'Regular check-in with client',
          instructions: typeof task.communication_channels === 'string' 
            ? task.communication_channels 
            : JSON.stringify(task.communication_channels || {}),
          is_mandatory: true,
          requires_attachment: false,
          display_order: index,
          check_in_frequency: task.check_in_frequency as any,
          check_in_notes: task.client_response_expectations,
          section_type: 'ongoing_support' as const
        })));
      }

      // Load Commitments tasks
      if (commitmentsRes.data && commitmentsRes.data.length > 0) {
        allTasks.push(...commitmentsRes.data.map(task => ({
          id: task.id,
          task_name: task.commitment_title || 'Commitment',
          description: task.commitment_description || '',
          instructions: 'Client must acknowledge this commitment',
          is_mandatory: task.requires_acknowledgment ?? true,
          requires_attachment: task.requires_signature ?? false,
          display_order: task.display_order || 0,
          section_type: 'commitments' as const
        })));
      }

      // If no tasks found, provide some default structure
      if (allTasks.length === 0) {
        const defaultTasks: CustomTask[] = [
          {
            id: 'default-getting-started-1',
            task_name: 'Welcome & Introduction',
            description: 'Complete your profile and initial assessment',
            instructions: 'Fill out your fitness goals and current fitness level',
            is_mandatory: true,
            requires_attachment: false,
            display_order: 0,
            section_type: 'getting_started'
          },
          {
            id: 'default-first-week-1',
            task_name: 'Initial Workout Session',
            description: 'Complete your first workout with your trainer',
            instructions: 'Schedule and attend your first training session',
            is_mandatory: true,
            requires_attachment: false,
            display_order: 0,
            section_type: 'first_week'
          },
          {
            id: 'default-ongoing-1',
            task_name: 'Weekly Check-in',
            description: 'Regular progress check with your trainer',
            instructions: 'Update your trainer on your progress and any challenges',
            is_mandatory: true,
            requires_attachment: false,
            display_order: 0,
            check_in_frequency: 'weekly',
            section_type: 'ongoing_support'
          },
          {
            id: 'default-commitment-1',
            task_name: 'Training Agreement',
            description: 'Agree to training terms and expectations',
            instructions: 'Read and acknowledge the training agreement',
            is_mandatory: true,
            requires_attachment: false,
            display_order: 0,
            section_type: 'commitments'
          }
        ];
        allTasks.push(...defaultTasks);
        toast.info('Template has no existing tasks. Starting with default structure that you can customize.');
      } else {
        toast.success(`Loaded ${allTasks.length} existing tasks from template for customization`);
      }

      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading template data:', error);
      toast.error('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  const getTasksBySection = (sectionType: string) => {
    return tasks.filter(task => task.section_type === sectionType)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const updateTask = (taskId: string, updates: Partial<CustomTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const addTask = (sectionType: string) => {
    const newTask: CustomTask = {
      id: `new-${Date.now()}`,
      task_name: 'New Task',
      description: '',
      instructions: '',
      is_mandatory: true,
      requires_attachment: false,
      display_order: getTasksBySection(sectionType).length,
      section_type: sectionType as any
    };
    setTasks(prev => [...prev, newTask]);
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleReorder = (sectionType: string, result: DropResult) => {
    if (!result.destination) return;

    const sectionTasks = getTasksBySection(sectionType);
    const [reorderedItem] = sectionTasks.splice(result.source.index, 1);
    sectionTasks.splice(result.destination.index, 0, reorderedItem);

    const updatedTasks = tasks.map(task => {
      if (task.section_type === sectionType) {
        const index = sectionTasks.findIndex(st => st.id === task.id);
        return { ...task, display_order: index };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  const handleAssignCustomizedTemplate = async () => {
    if (!user) return;

    setProcessingAssignment(true);
    try {
      // Create template assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('client_template_assignments')
        .insert({
          client_id: clientId,
          trainer_id: user.id,
          template_base_id: templateId,
          template_name: customizedName,
          assignment_notes: `Customized template with ${tasks.length} tasks`
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create progress records for customized tasks (check for duplicates first)
      const progressRecords = tasks.map((task, index) => ({
        client_id: clientId,
        trainer_id: user.id,
        template_step_id: task.id?.startsWith('new-') ? null : task.id,
        step_name: task.task_name,
        step_type: task.is_mandatory ? 'mandatory' : 'optional',
        description: task.description,
        instructions: task.instructions,
        requires_file_upload: task.requires_attachment,
        completion_method: 'client',
        display_order: index + 1,
        status: 'pending'
      }));

      // Check for existing progress records to avoid duplicates
      const existingProgressQuery = supabase
        .from('client_onboarding_progress')
        .select('template_step_id')
        .eq('client_id', clientId)
        .eq('trainer_id', user.id);

      // Only check for existing records that have valid template_step_ids
      const validStepIds = progressRecords
        .map(record => record.template_step_id)
        .filter(id => id !== null);

      if (validStepIds.length > 0) {
        existingProgressQuery.in('template_step_id', validStepIds);
      }

      const { data: existingProgress } = await existingProgressQuery;
      const existingStepIds = new Set(existingProgress?.map(p => p.template_step_id) || []);

      // Filter out records that already exist
      const newProgressRecords = progressRecords.filter(record => 
        record.template_step_id === null || !existingStepIds.has(record.template_step_id)
      );

      if (newProgressRecords.length > 0) {
        const { error: progressError } = await supabase
          .from('client_onboarding_progress')
          .insert(newProgressRecords);

        if (progressError) throw progressError;
      }

      // Send notification to client
      await supabase.from('alerts').insert({
        title: 'Customized Onboarding Template Assigned',
        content: `Your trainer has assigned you a customized onboarding template. Check your onboarding section to get started!`,
        alert_type: 'template_assigned',
        priority: 1,
        target_audience: { clients: [clientId] },
        metadata: {
          client_id: clientId,
          trainer_id: user.id,
          template_name: customizedName,
          assignment_id: assignment.id,
          customized: true
        },
        created_by: user.id
      });

      toast.success(`Customized template "${customizedName}" assigned successfully`);
      onClose();
      onAssignmentComplete?.();

    } catch (error) {
      console.error('Error assigning customized template:', error);
      toast.error('Failed to assign customized template');
    } finally {
      setProcessingAssignment(false);
    }
  };

  const renderTaskEditor = (task: CustomTask) => (
    <Card key={task.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Input
              value={task.task_name}
              onChange={(e) => updateTask(task.id!, { task_name: e.target.value })}
              className="font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={task.is_mandatory ? 'default' : 'secondary'}>
              {task.is_mandatory ? 'Required' : 'Optional'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTask(task.id!)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Description</Label>
          <Textarea
            value={task.description}
            onChange={(e) => updateTask(task.id!, { description: e.target.value })}
            rows={2}
          />
        </div>
        
        <div>
          <Label>Instructions</Label>
          <Textarea
            value={task.instructions}
            onChange={(e) => updateTask(task.id!, { instructions: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={task.is_mandatory}
              onCheckedChange={(checked) => updateTask(task.id!, { is_mandatory: checked })}
            />
            <Label>Required Task</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={task.requires_attachment}
              onCheckedChange={(checked) => updateTask(task.id!, { requires_attachment: checked })}
            />
            <Label>Requires File</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Due in (days)</Label>
            <Input
              type="number"
              min="0"
              value={task.due_days || ''}
              onChange={(e) => updateTask(task.id!, { due_days: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 7"
            />
          </div>
          {task.section_type === 'ongoing_support' && (
            <div>
              <Label>Check-in Frequency</Label>
              <Select
                value={task.check_in_frequency || 'none'}
                onValueChange={(value: any) => updateTask(task.id!, { check_in_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No check-ins</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {task.check_in_frequency && task.check_in_frequency !== 'none' && (
          <div>
            <Label>Check-in Instructions</Label>
            <Textarea
              value={task.check_in_notes || ''}
              onChange={(e) => updateTask(task.id!, { check_in_notes: e.target.value })}
              placeholder="What should the client report during check-ins?"
              rows={2}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSection = (sectionType: string, title: string, icon: React.ReactNode) => {
    const sectionTasks = getTasksBySection(sectionType);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
            <Badge variant="outline">{sectionTasks.length} tasks</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addTask(sectionType)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <DragDropContext onDragEnd={(result) => handleReorder(sectionType, result)}>
          <Droppable droppableId={sectionType}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {sectionTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id!} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {renderTaskEditor(task)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="customizer-description">
        <DialogHeader>
          <DialogTitle>Customize Template for {clientName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div id="customizer-description" className="space-y-6">
            <div>
              <Label>Template Name</Label>
              <Input
                value={customizedName}
                onChange={(e) => setCustomizedName(e.target.value)}
                placeholder="Enter customized template name"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="getting_started" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Getting Started
                </TabsTrigger>
                <TabsTrigger value="first_week" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  First Week
                </TabsTrigger>
                <TabsTrigger value="ongoing_support" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ongoing Support
                </TabsTrigger>
                <TabsTrigger value="commitments" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Commitments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="getting_started" className="mt-6">
                {renderSection('getting_started', 'Getting Started Tasks', <FileText className="h-5 w-5" />)}
              </TabsContent>

              <TabsContent value="first_week" className="mt-6">
                {renderSection('first_week', 'First Week Tasks', <Calendar className="h-5 w-5" />)}
              </TabsContent>

              <TabsContent value="ongoing_support" className="mt-6">
                {renderSection('ongoing_support', 'Ongoing Support', <MessageSquare className="h-5 w-5" />)}
              </TabsContent>

              <TabsContent value="commitments" className="mt-6">
                {renderSection('commitments', 'Commitments & Expectations', <CheckCircle className="h-5 w-5" />)}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignCustomizedTemplate} 
                disabled={processingAssignment || !customizedName.trim()}
              >
                {processingAssignment ? 'Assigning...' : 'Assign Customized Template'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}