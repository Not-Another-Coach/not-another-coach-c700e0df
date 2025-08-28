import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, AlertTriangle } from 'lucide-react';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { useTemplateAssignments } from '@/hooks/useTemplateAssignments';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientTemplateAssignmentButtonsProps {
  clientId: string;
  clientName: string;
  onAssignmentComplete?: () => void;
}

interface TemplateStep {
  id?: string;
  step_name: string;
  description: string;
  instructions: string;
  step_type: 'mandatory' | 'optional';
  completion_method: 'client' | 'trainer' | 'auto';
  requires_file_upload: boolean;
  display_order: number;
}

interface CustomizedTemplate {
  name: string;
  baseTemplateId: string;
  steps: TemplateStep[];
}

export function ClientTemplateAssignmentButtons({ 
  clientId, 
  clientName, 
  onAssignmentComplete 
}: ClientTemplateAssignmentButtonsProps) {
  const { user } = useAuth();
  const { templates, loading: templatesLoading } = useTemplateBuilder();
  const { hasActiveAssignment, getActiveAssignmentForClient, expireAssignment } = useTemplateAssignments();
  
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [showExistingAssignmentDialog, setShowExistingAssignmentDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customizedTemplate, setCustomizedTemplate] = useState<CustomizedTemplate | null>(null);
  const [processingAssignment, setProcessingAssignment] = useState(false);
  const [pendingAssignmentType, setPendingAssignmentType] = useState<'assign' | 'customize'>('assign');

  // Filter for published templates
  const publishedTemplates = templates.filter(template => template.status === 'published');

  const existingAssignment = hasActiveAssignment(clientId) ? getActiveAssignmentForClient(clientId) : null;

  const handleDirectAssign = () => {
    if (existingAssignment) {
      setPendingAssignmentType('assign');
      setShowExistingAssignmentDialog(true);
      return;
    }
    setShowAssignDialog(true);
  };

  const handleCustomizeAndAssign = () => {
    if (existingAssignment) {
      setPendingAssignmentType('customize');
      setShowExistingAssignmentDialog(true);
      return;
    }
    setShowAssignDialog(true);
  };

  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (pendingAssignmentType === 'customize') {
      // Load template for customization
      const template = publishedTemplates.find(t => t.id === templateId);
      if (template) {
        setCustomizedTemplate({
          name: template.step_name,
          baseTemplateId: templateId,
          steps: [{
            id: template.id,
            step_name: template.step_name,
            description: template.description || '',
            instructions: template.instructions || '',
            step_type: template.step_type || 'mandatory',
            completion_method: template.completion_method || 'client',
            requires_file_upload: template.requires_file_upload || false,
            display_order: 0
          }]
        });
        setShowAssignDialog(false);
        setShowCustomizeDialog(true);
      }
    } else {
      // Direct assignment
      handleDirectAssignment();
    }
  };

  const handleDirectAssignment = async () => {
    if (!selectedTemplate || !user) return;

    setProcessingAssignment(true);
    try {
      const template = publishedTemplates.find(t => t.id === selectedTemplate);
      if (!template) {
        toast.error('Template not found');
        return;
      }

      // Create template assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('client_template_assignments')
        .insert({
          client_id: clientId,
          trainer_id: user.id,
          template_id: selectedTemplate,
          template_name: template.step_name,
          assignment_type: 'direct',
          assignment_notes: `Directly assigned template: ${template.step_name}`,
          assigned_by: user.id
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create progress record for the step
      const progressRecord = {
        client_id: clientId,
        trainer_id: user.id,
        template_step_id: template.id,
        step_name: template.step_name,
        step_type: template.step_type || 'mandatory',
        description: template.description || '',
        instructions: template.instructions || '',
        requires_file_upload: template.requires_file_upload || false,
        completion_method: template.completion_method || 'client',
        display_order: 1,
        status: 'pending'
      };

      const { error: progressError } = await supabase
        .from('client_onboarding_progress')
        .insert([progressRecord]);

      if (progressError) throw progressError;

      // Send notification to client
      await supabase.from('alerts').insert({
        title: 'New Onboarding Template Assigned',
        content: `Your trainer has assigned you new onboarding templates. Check your onboarding section to get started!`,
        alert_type: 'template_assigned',
        priority: 1,
        target_audience: { clients: [clientId] },
        metadata: {
          client_id: clientId,
          trainer_id: user.id,
          template_id: selectedTemplate,
          template_name: template.step_name,
          assignment_id: assignment.id
        },
        created_by: user.id
      });

      toast.success(`Template "${template.step_name}" assigned successfully`);
      setShowAssignDialog(false);
      setSelectedTemplate('');
      onAssignmentComplete?.();
      
    } catch (error) {
      console.error('Error assigning template:', error);
      toast.error('Failed to assign template');
    } finally {
      setProcessingAssignment(false);
    }
  };

  const handleCustomizedAssignment = async () => {
    if (!customizedTemplate || !user) return;

    setProcessingAssignment(true);
    try {
      // Create template assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('client_template_assignments')
        .insert({
          client_id: clientId,
          trainer_id: user.id,
          template_id: customizedTemplate.baseTemplateId,
          template_name: customizedTemplate.name,
          assignment_type: 'customized',
          assignment_notes: `Customized template with ${customizedTemplate.steps.length} steps`,
          assigned_by: user.id
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create progress records for customized steps
      if (customizedTemplate.steps.length > 0) {
        const progressRecords = customizedTemplate.steps.map((step, index) => ({
          client_id: clientId,
          trainer_id: user.id,
          template_step_id: step.id || null,
          step_name: step.step_name,
          step_type: step.step_type,
          description: step.description,
          instructions: step.instructions,
          requires_file_upload: step.requires_file_upload,
          completion_method: step.completion_method,
          display_order: index + 1,
          status: 'pending'
        }));

        const { error: progressError } = await supabase
          .from('client_onboarding_progress')
          .insert(progressRecords);

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
          template_name: customizedTemplate.name,
          assignment_id: assignment.id,
          customized: true
        },
        created_by: user.id
      });

      toast.success(`Customized template "${customizedTemplate.name}" assigned successfully`);
      setShowCustomizeDialog(false);
      setCustomizedTemplate(null);
      setSelectedTemplate('');
      onAssignmentComplete?.();
      
    } catch (error) {
      console.error('Error assigning customized template:', error);
      toast.error('Failed to assign customized template');
    } finally {
      setProcessingAssignment(false);
    }
  };

  const handleExpireAndContinue = async () => {
    if (!existingAssignment) return;
    
    try {
      const result = await expireAssignment(existingAssignment.id, 'Expired to assign new template');
      
      if (result.success) {
        setShowExistingAssignmentDialog(false);
        
        // Continue with the pending assignment
        if (pendingAssignmentType === 'customize') {
          setShowAssignDialog(true);
        } else {
          setShowAssignDialog(true);
        }
      } else {
        toast.error('Failed to expire existing assignment');
      }
    } catch (error) {
      console.error('Error expiring assignment:', error);
      toast.error('Failed to expire existing assignment');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleDirectAssign}
          disabled={templatesLoading || publishedTemplates.length === 0}
        >
          <Plus className="w-3 h-3 mr-1" />
          Assign
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCustomizeAndAssign}
          disabled={templatesLoading || publishedTemplates.length === 0}
        >
          <Edit2 className="w-3 h-3 mr-1" />
          Customize & Assign
        </Button>
      </div>

      {/* Template Selection Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAssignmentType === 'customize' ? 'Select Template to Customize' : `Assign Template to ${clientName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {publishedTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.step_name}</span>
                        <Badge variant="outline" className="text-xs">
                          Template
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {publishedTemplates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No published templates available. Create and publish templates first.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              {pendingAssignmentType === 'assign' && selectedTemplate && (
                <Button onClick={handleDirectAssignment} disabled={processingAssignment}>
                  {processingAssignment ? 'Assigning...' : 'Assign Template'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Customization Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Template for {clientName}</DialogTitle>
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
                <h4 className="font-medium">Template Steps</h4>
                {customizedTemplate.steps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Step {index + 1}: {step.step_name}</Label>
                      <Badge variant={step.step_type === 'mandatory' ? 'default' : 'secondary'}>
                        {step.step_type}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label>Step Name</Label>
                      <Input
                        value={step.step_name}
                        onChange={(e) => {
                          const updatedSteps = [...customizedTemplate.steps];
                          updatedSteps[index] = { ...step, step_name: e.target.value };
                          setCustomizedTemplate({ ...customizedTemplate, steps: updatedSteps });
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) => {
                          const updatedSteps = [...customizedTemplate.steps];
                          updatedSteps[index] = { ...step, description: e.target.value };
                          setCustomizedTemplate({ ...customizedTemplate, steps: updatedSteps });
                        }}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label>Instructions</Label>
                      <Textarea
                        value={step.instructions}
                        onChange={(e) => {
                          const updatedSteps = [...customizedTemplate.steps];
                          updatedSteps[index] = { ...step, instructions: e.target.value };
                          setCustomizedTemplate({ ...customizedTemplate, steps: updatedSteps });
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCustomizedAssignment} disabled={processingAssignment}>
                  {processingAssignment ? 'Assigning...' : 'Assign Customized Template'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Assignment Dialog */}
      <Dialog open={showExistingAssignmentDialog} onOpenChange={setShowExistingAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Active Template Assignment Exists
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {clientName} already has an active template assignment.
            </p>
            
            {existingAssignment && (
              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <p className="text-sm"><strong>Template:</strong> {existingAssignment.template_name}</p>
                <p className="text-sm"><strong>Assigned:</strong> {new Date(existingAssignment.assigned_at).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Status:</strong> <Badge variant="default">Active</Badge></p>
              </div>
            )}
            
            <p className="text-sm">
              Would you like to expire the current template and assign the new one? This will mark the current template as expired and allow you to proceed with the new assignment.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExistingAssignmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExpireAndContinue}>
                Expire Current & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
