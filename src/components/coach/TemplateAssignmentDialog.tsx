import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Edit2, Plus } from 'lucide-react';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { useAuth } from '@/hooks/useAuth';
import { useTemplateAssignments } from '@/hooks/useTemplateAssignments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

interface TemplateStep {
  id?: string;
  step_name: string;
  description: string;
  instructions: string;
  step_type: 'mandatory' | 'optional';
  completion_method: 'client' | 'trainer';
  requires_file_upload: boolean;
  display_order: number;
}

interface CustomizedTemplate {
  name: string;
  baseTemplateId: string;
  steps: TemplateStep[];
}

interface TemplateAssignmentDialogProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete?: () => void;
}

export function TemplateAssignmentDialog({ 
  client, 
  isOpen, 
  onClose, 
  onAssignmentComplete 
}: TemplateAssignmentDialogProps) {
  const { user } = useAuth();
  const { templates, loading: templatesLoading } = useTemplateBuilder();
  const { hasActiveAssignment, getActiveAssignmentForClient } = useTemplateAssignments();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customizedTemplate, setCustomizedTemplate] = useState<CustomizedTemplate | null>(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter for published templates
  const publishedTemplates = templates.filter(t => t.status === 'published');

  const handleCustomizeTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Fetch trainer's activities to create multiple steps
    const { data: activities, error: activitiesError } = await supabase
      .from('trainer_onboarding_activities')
      .select('*')
      .eq('trainer_id', user?.id)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      toast.error('Failed to load activities');
      return;
    }

    // Create steps from activities, grouped by category
    const steps: TemplateStep[] = activities?.map((activity, index) => ({
      step_name: activity.activity_name,
      description: activity.description || '',
      instructions: activity.instructions || '',
      step_type: 'mandatory', // Default to mandatory since is_mandatory doesn't exist
      completion_method: (activity.completion_method === 'client' || activity.completion_method === 'trainer') 
        ? activity.completion_method as 'client' | 'trainer' 
        : 'client',
      requires_file_upload: activity.requires_file_upload || false,
      display_order: index + 1
    })) || [
      // Fallback single step if no activities found
      {
        step_name: template.step_name,
        description: template.description || '',
        instructions: template.instructions || '',
        step_type: template.step_type,
        completion_method: template.completion_method === 'auto' ? 'client' : template.completion_method,
        requires_file_upload: template.requires_file_upload || false,
        display_order: 1
      }
    ];

    const customized: CustomizedTemplate = {
      name: `${template.step_name} (Customized)`,
      baseTemplateId: templateId,
      steps
    };

    setCustomizedTemplate(customized);
    setShowCustomizeDialog(true);
  };

  const handleAssignTemplate = async () => {
    if (!customizedTemplate || !user) return;

    // Check if client already has an active assignment
    if (hasActiveAssignment(client.id)) {
      const existingAssignment = getActiveAssignmentForClient(client.id);
      toast.error(`Client already has an active template assignment: ${existingAssignment?.template_name}. Please expire or remove it first.`);
      return;
    }

    try {
      setLoading(true);

      const correlationId = crypto.randomUUID();

      // First create template assignment record
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('client_template_assignments')
        .insert({
          client_id: client.id,
          trainer_id: user.id,
          template_name: customizedTemplate.name,
          template_base_id: customizedTemplate.baseTemplateId,
          assignment_notes: `Manually assigned template with ${customizedTemplate.steps.length} steps`,
          correlation_id: correlationId
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create onboarding progress records for each step
      const steps = customizedTemplate.steps.map((step, index) => ({
        client_id: client.id,
        trainer_id: user.id,
        step_name: step.step_name,
        description: step.description,
        instructions: step.instructions,
        step_type: step.step_type,
        completion_method: step.completion_method,
        requires_file_upload: step.requires_file_upload,
        display_order: index + 1,
        status: 'pending',
        assignment_id: assignmentData.id,
        correlation_id: correlationId
      }));

      const { error: stepsError } = await supabase
        .from('client_onboarding_progress')
        .insert(steps);

      if (stepsError) throw stepsError;

      // Create notification alert for client
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          alert_type: 'template_assigned',
          title: 'New Training Templates Assigned',
          content: `Your trainer has assigned you new onboarding templates. Check your onboarding section to get started!`,
          target_audience: JSON.stringify({ clients: [client.id] }),
          created_by: user.id,
          metadata: {
            client_id: client.id,
            trainer_id: user.id,
            template_name: customizedTemplate.name,
            steps_count: customizedTemplate.steps.length,
            assignment_id: assignmentData.id
          }
        });

      if (alertError) throw alertError;

      toast.success(`Template assigned to ${client.first_name} ${client.last_name}`);
      
      // Reset and close
      setSelectedTemplate('');
      setCustomizedTemplate(null);
      setShowCustomizeDialog(false);
      onClose();
      onAssignmentComplete?.();

    } catch (error) {
      console.error('Error assigning template:', error);
      toast.error('Failed to assign template');
    } finally {
      setLoading(false);
    }
  };

  const updateTemplateStep = (index: number, updates: Partial<TemplateStep>) => {
    if (!customizedTemplate) return;

    const updatedSteps = [...customizedTemplate.steps];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    
    setCustomizedTemplate({
      ...customizedTemplate,
      steps: updatedSteps
    });
  };

  const addTemplateStep = () => {
    if (!customizedTemplate) return;

    const newStep: TemplateStep = {
      step_name: '',
      description: '',
      instructions: '',
      step_type: 'mandatory',
      completion_method: 'client',
      requires_file_upload: false,
      display_order: customizedTemplate.steps.length + 1
    };

    setCustomizedTemplate({
      ...customizedTemplate,
      steps: [...customizedTemplate.steps, newStep]
    });
  };

  const removeTemplateStep = (index: number) => {
    if (!customizedTemplate) return;

    const updatedSteps = customizedTemplate.steps.filter((_, i) => i !== index);
    setCustomizedTemplate({
      ...customizedTemplate,
      steps: updatedSteps
    });
  };

  return (
    <>
      <Dialog open={isOpen && !showCustomizeDialog} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Template to {client.first_name} {client.last_name}</DialogTitle>
            <DialogDescription>
              Choose a published template to assign to your client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Template to Assign</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose a published template for {client.first_name} {client.last_name}
              </p>
              {publishedTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No published templates available. Create and publish templates first.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {publishedTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors ${selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="font-medium">{template.step_name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                        <div className="flex gap-2">
                          <Badge variant={template.step_type === 'mandatory' ? 'default' : 'secondary'}>
                            {template.step_type}
                          </Badge>
                          <Badge variant="outline">{template.completion_method}</Badge>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {selectedTemplate && (
              <div className="flex gap-2">
                <Button onClick={() => handleCustomizeTemplate(selectedTemplate)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Customize & Assign
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Customization Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={(open) => {
        setShowCustomizeDialog(open);
        if (!open) {
          setSelectedTemplate('');
          setCustomizedTemplate(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Template for {client.first_name} {client.last_name}</DialogTitle>
            <DialogDescription>
              Customize the onboarding template steps before assigning them to your client.
            </DialogDescription>
          </DialogHeader>
          
          {customizedTemplate && (
            <div className="space-y-6">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={customizedTemplate.name}
                  onChange={(e) => setCustomizedTemplate({
                    ...customizedTemplate,
                    name: e.target.value
                  })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Template Steps</h3>
                  <Button size="sm" onClick={addTemplateStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {customizedTemplate.steps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Step Name</Label>
                          <Input
                            value={step.step_name}
                            onChange={(e) => updateTemplateStep(index, { step_name: e.target.value })}
                            placeholder="Enter step name..."
                          />
                        </div>
                        <div>
                          <Label>Step Type</Label>
                          <Select
                            value={step.step_type}
                            onValueChange={(value: 'mandatory' | 'optional') => 
                              updateTemplateStep(index, { step_type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mandatory">Mandatory</SelectItem>
                              <SelectItem value="optional">Optional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={step.description}
                          onChange={(e) => updateTemplateStep(index, { description: e.target.value })}
                          placeholder="Brief description of this step..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Instructions</Label>
                        <Textarea
                          value={step.instructions}
                          onChange={(e) => updateTemplateStep(index, { instructions: e.target.value })}
                          placeholder="Detailed instructions for the client..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Completion Method</Label>
                          <Select
                            value={step.completion_method}
                            onValueChange={(value: 'client' | 'trainer') => 
                              updateTemplateStep(index, { completion_method: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">Client completes</SelectItem>
                              <SelectItem value="trainer">Trainer marks complete</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`file-upload-${index}`}
                            checked={step.requires_file_upload}
                            onCheckedChange={(checked) => updateTemplateStep(index, { requires_file_upload: checked })}
                          />
                          <Label htmlFor={`file-upload-${index}`}>Requires file upload</Label>
                        </div>
                      </div>

                      {customizedTemplate.steps.length > 1 && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTemplateStep(index)}
                          >
                            Remove Step
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignTemplate} disabled={loading}>
                  {loading ? 'Assigning...' : 'Assign Template'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}