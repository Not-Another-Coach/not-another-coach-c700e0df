import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Edit2, Users, User, Copy } from 'lucide-react';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActiveClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  client_status: string;
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
  due_in_days?: number;
  sla_days?: number;
}

interface CustomizedTemplate {
  name: string;
  baseTemplateId: string;
  steps: TemplateStep[];
}

export function ManualTemplateAssignment() {
  const { user } = useAuth();
  const { templates, loading: templatesLoading } = useTemplateBuilder();
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ActiveClient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customizedTemplate, setCustomizedTemplate] = useState<CustomizedTemplate | null>(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Fetch active clients
  useEffect(() => {
    const fetchActiveClients = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Get active client engagements first
        const { data: engagements, error: engagementError } = await supabase
          .from('client_trainer_engagement')
          .select('client_id')
          .eq('trainer_id', user.id)
          .eq('stage', 'active_client');

        if (engagementError) throw engagementError;

        const clientIds = engagements?.map(e => e.client_id) || [];
        
        if (clientIds.length > 0) {
          // Get profile information for these clients
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, client_status')
            .in('id', clientIds);

          if (profilesError) throw profilesError;

          // Get emails from auth.users (if accessible) or use a placeholder
          const clients = profiles?.map(profile => ({
            id: profile.id,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: 'Email not available', // We'll show name instead
            client_status: profile.client_status || ''
          })) || [];

          setActiveClients(clients);
        } else {
          setActiveClients([]);
        }
      } catch (error) {
        console.error('Error fetching active clients:', error);
        toast.error('Failed to load active clients');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveClients();
  }, [user]);

  const filteredClients = activeClients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const publishedTemplates = templates.filter(t => t.status === 'published' && t.is_active);

  console.log('Templates loaded:', templates.length, 'Published:', publishedTemplates.length);

  const handleCustomizeTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // For now, create a basic customized template
    // In a full implementation, you'd fetch the template steps
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
          display_order: 1,
          due_in_days: 7,
          sla_days: 2
        }
      ]
    };

    setCustomizedTemplate(customized);
    setShowCustomizeDialog(true);
  };

  const handleAssignTemplate = async () => {
    if (!selectedClient || !customizedTemplate || !user) return;

    try {
      setLoading(true);

      // Create onboarding progress records for each step
      const steps = customizedTemplate.steps.map((step, index) => ({
        client_id: selectedClient.id,
        trainer_id: user.id,
        step_name: step.step_name,
        description: step.description,
        instructions: step.instructions,
        step_type: step.step_type,
        completion_method: step.completion_method,
        requires_file_upload: step.requires_file_upload,
        display_order: index + 1,
        due_in_days: step.due_in_days,
        sla_days: step.sla_days,
        status: 'pending'
      }));

      const { error: stepsError } = await supabase
        .from('client_onboarding_progress')
        .insert(steps);

      if (stepsError) throw stepsError;

      // Create notification alert
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          alert_type: 'template_assigned',
          title: 'New Training Templates Assigned',
          content: `Your trainer has assigned you new onboarding templates. Check your onboarding section to get started!`,
          target_audience: JSON.stringify({ clients: [selectedClient.id] }),
          created_by: user.id,
          metadata: {
            client_id: selectedClient.id,
            trainer_id: user.id,
            template_name: customizedTemplate.name,
            steps_count: customizedTemplate.steps.length
          }
        });

      if (alertError) throw alertError;

      toast.success(`Template assigned to ${selectedClient.first_name} ${selectedClient.last_name}`);
      
      // Reset form
      setSelectedClient(null);
      setSelectedTemplate('');
      setCustomizedTemplate(null);
      setShowAssignDialog(false);
      setShowCustomizeDialog(false);

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
      display_order: customizedTemplate.steps.length + 1,
      due_in_days: 7,
      sla_days: 2
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

  if (templatesLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manual Template Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Manual Template Assignment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign and customize onboarding templates for your active clients
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="client-search">Search Active Clients</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="client-search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No clients found matching your search.' : 'No active clients found.'}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
                <Card 
                  key={client.id} 
                  className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{client.first_name} {client.last_name}</p>
                        <p className="text-sm text-muted-foreground">ID: {client.id.slice(0, 8)}...</p>
                        <Badge variant="secondary" className="text-xs">{client.client_status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Template Selection */}
        {selectedClient && (
          <div className="space-y-4">
            <div>
              <Label>Select Template to Assign</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose a published template for {selectedClient.first_name} {selectedClient.last_name}
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
        )}

        {/* Template Customization Dialog */}
        <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customize Template for {selectedClient?.first_name} {selectedClient?.last_name}</DialogTitle>
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
                              placeholder="e.g., Complete Initial Assessment"
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
                            placeholder="Brief description of what this step involves"
                          />
                        </div>

                        <div>
                          <Label>Instructions</Label>
                          <Textarea
                            value={step.instructions}
                            onChange={(e) => updateTemplateStep(index, { instructions: e.target.value })}
                            placeholder="Detailed instructions for the client"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="trainer">Trainer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Due in (days)</Label>
                            <Input
                              type="number"
                              value={step.due_in_days || ''}
                              onChange={(e) => updateTemplateStep(index, { 
                                due_in_days: e.target.value ? parseInt(e.target.value) : undefined 
                              })}
                              placeholder="7"
                            />
                          </div>
                          <div>
                            <Label>SLA (days)</Label>
                            <Input
                              type="number"
                              value={step.sla_days || ''}
                              onChange={(e) => updateTemplateStep(index, { 
                                sla_days: e.target.value ? parseInt(e.target.value) : undefined 
                              })}
                              placeholder="2"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={step.requires_file_upload}
                              onCheckedChange={(checked) => 
                                updateTemplateStep(index, { requires_file_upload: checked })
                              }
                            />
                            <Label>Requires file upload</Label>
                          </div>
                          {customizedTemplate.steps.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTemplateStep(index)}
                            >
                              Remove Step
                            </Button>
                          )}
                        </div>
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
      </CardContent>
    </Card>
  );
}