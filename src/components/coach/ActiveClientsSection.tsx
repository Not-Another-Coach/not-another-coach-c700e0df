import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { Users, MessageCircle, Calendar, UserCheck, Plus, Edit2 } from 'lucide-react';
import { DiscoveryCallNotesTaker } from '@/components/DiscoveryCallNotesTaker';
import { MessagingPopup } from '@/components/MessagingPopup';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { useAuth } from '@/hooks/useAuth';
import { useTemplateAssignments } from '@/hooks/useTemplateAssignments';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ClientTemplateAssignmentButtons } from '@/components/coach/ClientTemplateAssignmentButtons';

interface ActiveClient {
  id: string;
  client_id: string;
  trainer_id: string;
  stage: string;
  became_client_at: string;
  notes?: string;
  client_profile?: {
    first_name?: string;
    last_name?: string;
    primary_goals?: string[];
    training_location_preference?: string;
  };
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

interface ActiveClientsSectionProps {
  onCountChange?: (count: number) => void;
}

export function ActiveClientsSection({ onCountChange }: ActiveClientsSectionProps) {
  const { profile } = useProfile();
  const { user } = useAuth();
  const { templates, loading: templatesLoading } = useTemplateBuilder();
  const { hasActiveAssignment, getActiveAssignmentForClient, expireAssignment } = useTemplateAssignments();
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagingPopupOpen, setMessagingPopupOpen] = useState(false);
  const [selectedClientForMessaging, setSelectedClientForMessaging] = useState<any>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedClientForAssignment, setSelectedClientForAssignment] = useState<ActiveClient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customizedTemplate, setCustomizedTemplate] = useState<CustomizedTemplate | null>(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [processingAssignment, setProcessingAssignment] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingAssignment, setExistingAssignment] = useState<any>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchActiveClients();
    } else {
      setLoading(false);
    }
  }, [profile?.id]);

  const fetchActiveClients = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // First get the engagement data
      const { data: engagementData, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('*')
        .eq('trainer_id', profile.id)
        .eq('stage', 'active_client')
        .order('became_client_at', { ascending: false });

      if (engagementError) {
        console.error('Error fetching engagement data:', engagementError);
        setActiveClients([]);
        onCountChange?.(0);
        setLoading(false);
        return;
      }

      if (!engagementData || engagementData.length === 0) {
        setActiveClients([]);
        onCountChange?.(0);
        return;
      }

      // Get client profiles for these engagements
      const clientIds = engagementData.map(eng => eng.client_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, primary_goals, training_location_preference')
        .in('id', clientIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Merge the data
      const mergedData = engagementData.map(engagement => ({
        ...engagement,
        client_profile: profilesData?.find(profile => profile.id === engagement.client_id) || null
      }));

      setActiveClients(mergedData as ActiveClient[]);
      onCountChange?.(mergedData.length);
    } catch (error) {
      console.error('Error fetching active clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter for published templates (same as Template Management)
  const publishedTemplates = templates.filter(t => t.status === 'published');

  const handleCustomizeTemplate = async (templateId: string, client: ActiveClient) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Check if client already has an active assignment
    if (hasActiveAssignment(client.client_id)) {
      const existing = getActiveAssignmentForClient(client.client_id);
      setExistingAssignment(existing);
      setSelectedClientForAssignment(client);
      setSelectedTemplate(templateId);
      setShowConfirmDialog(true);
      return;
    }

    const customized: CustomizedTemplate = {
      name: `${template.step_name} (Customized)`,
      baseTemplateId: templateId,
      steps: [
        {
          step_name: template.step_name,
          description: template.description || '',
          instructions: template.instructions || '',
          step_type: template.step_type,
          completion_method: template.completion_method === 'auto' ? 'client' : template.completion_method,
          requires_file_upload: template.requires_file_upload || false,
          display_order: 1
        }
      ]
    };

    setCustomizedTemplate(customized);
    setSelectedClientForAssignment(client);
    setShowCustomizeDialog(true);
  };

  const handleConfirmExpireAndAssign = async () => {
    if (!existingAssignment || !selectedTemplate || !selectedClientForAssignment) return;

    try {
      setProcessingAssignment(true);
      
      // First expire the existing assignment
      const result = await expireAssignment(existingAssignment.id, 'Expired to assign new template');
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Now proceed with template customization
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      const customized: CustomizedTemplate = {
        name: `${template.step_name} (Customized)`,
        baseTemplateId: selectedTemplate,
        steps: [
          {
            step_name: template.step_name,
            description: template.description || '',
            instructions: template.instructions || '',
            step_type: template.step_type,
            completion_method: template.completion_method === 'auto' ? 'client' : template.completion_method,
            requires_file_upload: template.requires_file_upload || false,
            display_order: 1
          }
        ]
      };

      setCustomizedTemplate(customized);
      setShowConfirmDialog(false);
      setShowCustomizeDialog(true);
    } catch (error) {
      console.error('Error expiring assignment:', error);
      toast.error('Failed to expire existing assignment');
    } finally {
      setProcessingAssignment(false);
    }
  };

  const handleAssignTemplate = async () => {
    if (!selectedClientForAssignment || !customizedTemplate || !user) return;

    try {
      setProcessingAssignment(true);

      const correlationId = crypto.randomUUID();

      // First create template assignment record
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('client_template_assignments')
        .insert({
          client_id: selectedClientForAssignment.client_id,
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
        client_id: selectedClientForAssignment.client_id,
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
          alert_type: 'coach_update',
          title: 'New Training Templates Assigned',
          content: `Your trainer has assigned you new onboarding templates. Check your onboarding section to get started!`,
          target_audience: JSON.stringify({ clients: [selectedClientForAssignment.client_id] }),
          created_by: user.id,
          metadata: {
            client_id: selectedClientForAssignment.client_id,
            trainer_id: user.id,
            template_name: customizedTemplate.name,
            steps_count: customizedTemplate.steps.length,
            assignment_id: assignmentData.id
          }
        });

      if (alertError) throw alertError;

      const clientName = selectedClientForAssignment.client_profile?.first_name && selectedClientForAssignment.client_profile?.last_name
        ? `${selectedClientForAssignment.client_profile.first_name} ${selectedClientForAssignment.client_profile.last_name}`
        : `Client ${selectedClientForAssignment.client_id.slice(0, 8)}`;

      toast.success(`Template assigned to ${clientName}`);
      
      // Reset form
      setSelectedClientForAssignment(null);
      setSelectedTemplate('');
      setCustomizedTemplate(null);
      setShowAssignDialog(false);
      setShowCustomizeDialog(false);

    } catch (error) {
      console.error('Error assigning template:', error);
      toast.error('Failed to assign template');
    } finally {
      setProcessingAssignment(false);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Active Clients ({activeClients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeClients.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No active clients yet</h3>
            <p className="text-sm text-muted-foreground">
              When clients sign up and start training with you, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {client.client_profile?.first_name && client.client_profile?.last_name
                          ? `${client.client_profile.first_name} ${client.client_profile.last_name}`
                          : `Client ${client.client_id.slice(0, 8)}`}
                      </h4>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active Client
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Started {format(new Date(client.became_client_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {client.client_profile?.primary_goals && client.client_profile.primary_goals.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Goals:</strong> {client.client_profile.primary_goals.join(', ')}
                      </p>
                    )}
                    {client.client_profile?.training_location_preference && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Location Preference:</strong> {client.client_profile.training_location_preference}
                      </p>
                    )}
                    {client.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Notes:</strong> {client.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedClientForMessaging({
                        id: client.client_id,
                        user_id: client.client_id,
                        client_profile: client.client_profile
                      });
                      setMessagingPopupOpen(true);
                    }}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement view profile functionality
                      console.log('View profile:', client.client_id);
                    }}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    View Profile
                  </Button>
                </div>
                
                {/* Template Assignment Section */}
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Template Assignment</h4>
                      <ClientTemplateAssignmentButtons 
                        clientId={client.client_id}
                        clientName={`${client.client_profile?.first_name || ''} ${client.client_profile?.last_name || ''}`}
                        onAssignmentComplete={() => {
                          // Refresh the client data or assignments
                          console.log('Assignment completed for client:', client.client_id);
                        }}
                      />
                    </div>
                    
                    {/* Show active assignment if exists */}
                    {(() => {
                      const activeAssignment = hasActiveAssignment(client.client_id) ? getActiveAssignmentForClient(client.client_id) : null;
                      return activeAssignment ? (
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Active</Badge>
                            <span className="font-medium">{activeAssignment.template_name}</span>
                          </div>
                          <p className="text-muted-foreground">
                            Assigned {format(new Date(activeAssignment.assigned_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No active template assigned
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <MessagingPopup
        isOpen={messagingPopupOpen}
        onClose={() => {
          setMessagingPopupOpen(false);
          setSelectedClientForMessaging(null);
        }}
        selectedClient={selectedClientForMessaging}
      />

      {/* Template Assignment Dialog - Same as Template Management */}
      <Dialog open={showAssignDialog} onOpenChange={(open) => {
        setShowAssignDialog(open);
        if (!open) {
          setSelectedClientForAssignment(null);
          setSelectedTemplate('');
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Assign Template to {selectedClientForAssignment?.client_profile?.first_name} {selectedClientForAssignment?.client_profile?.last_name}
            </DialogTitle>
            <DialogDescription>
              Choose a published template to assign to your client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Template to Assign</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose a published template for {selectedClientForAssignment?.client_profile?.first_name} {selectedClientForAssignment?.client_profile?.last_name}
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

            {selectedTemplate && selectedClientForAssignment && (
              <div className="flex gap-2">
                <Button onClick={() => handleCustomizeTemplate(selectedTemplate, selectedClientForAssignment)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Customize & Assign
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Customization Dialog - Same as Template Management */}
      <Dialog open={showCustomizeDialog} onOpenChange={(open) => {
        setShowCustomizeDialog(open);
        if (!open) {
          setSelectedTemplate('');
          setCustomizedTemplate(null);
          setSelectedClientForAssignment(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Customize Template for {selectedClientForAssignment?.client_profile?.first_name} {selectedClientForAssignment?.client_profile?.last_name}
            </DialogTitle>
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
                <Button onClick={handleAssignTemplate} disabled={processingAssignment}>
                  {processingAssignment ? 'Assigning...' : 'Assign Template'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Existing Assignment */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        setShowConfirmDialog(open);
        if (!open) {
          setExistingAssignment(null);
          setSelectedClientForAssignment(null);
          setSelectedTemplate('');
          setProcessingAssignment(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Already Has Active Template</DialogTitle>
            <DialogDescription>
              {selectedClientForAssignment?.client_profile?.first_name} {selectedClientForAssignment?.client_profile?.last_name} already has an active template assignment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {existingAssignment && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Assignment:</h4>
                <p className="text-sm"><strong>Template:</strong> {existingAssignment.template_name}</p>
                <p className="text-sm"><strong>Assigned:</strong> {format(new Date(existingAssignment.assigned_at), 'MMM d, yyyy')}</p>
                {existingAssignment.assignment_notes && (
                  <p className="text-sm"><strong>Notes:</strong> {existingAssignment.assignment_notes}</p>
                )}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Would you like to expire the current template and assign the new one? This will mark the current template as expired and allow you to proceed with the new assignment.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={processingAssignment}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmExpireAndAssign}
              disabled={processingAssignment}
            >
              {processingAssignment ? 'Processing...' : 'Expire & Assign New'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}