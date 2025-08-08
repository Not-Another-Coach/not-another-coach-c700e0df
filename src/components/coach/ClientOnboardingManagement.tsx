import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2, Users, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTrainerOnboarding, OnboardingTemplate, ClientOnboardingData } from '@/hooks/useTrainerOnboarding';
import { toast } from 'sonner';

export function ClientOnboardingManagement() {
  const { 
    templates, 
    loading, 
    createTemplate, 
    updateTemplate
  } = useTrainerOnboarding();
  
  const [newTemplate, setNewTemplate] = useState<Partial<OnboardingTemplate>>({
    step_name: '',
    step_type: 'mandatory',
    description: '',
    instructions: '',
    requires_file_upload: false,
    completion_method: 'client',
    display_order: templates.length,
    is_active: true
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.step_name) {
      toast.error('Step name is required');
      return;
    }

    const result = await createTemplate(newTemplate as Omit<OnboardingTemplate, 'id'>);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Template created successfully');
      setNewTemplate({
        step_name: '',
        step_type: 'mandatory',
        description: '',
        instructions: '',
        requires_file_upload: false,
        completion_method: 'client',
        display_order: templates.length,
        is_active: true
      });
      setShowCreateDialog(false);
    }
  };

  const handleUpdateTemplate = async (templateId: string, updates: Partial<OnboardingTemplate>) => {
    const result = await updateTemplate(templateId, updates);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Template updated successfully');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Template Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Onboarding Templates</h3>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Onboarding Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Step Name</Label>
                  <Input
                    value={newTemplate.step_name || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, step_name: e.target.value })}
                    placeholder="e.g., Complete Pre-Coaching Questionnaire"
                  />
                </div>
                <div>
                  <Label>Step Type</Label>
                  <Select 
                    value={newTemplate.step_type} 
                    onValueChange={(value: 'mandatory' | 'optional') => 
                      setNewTemplate({ ...newTemplate, step_type: value })
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
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTemplate.description || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Brief description of the step"
                  />
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    value={newTemplate.instructions || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, instructions: e.target.value })}
                    placeholder="Detailed instructions for the client"
                  />
                </div>
                <div>
                  <Label>Completion Method</Label>
                  <Select 
                    value={newTemplate.completion_method} 
                    onValueChange={(value: 'client' | 'trainer' | 'auto') => 
                      setNewTemplate({ ...newTemplate, completion_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client marks complete</SelectItem>
                      <SelectItem value="trainer">Trainer marks complete</SelectItem>
                      <SelectItem value="auto">Auto-complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newTemplate.requires_file_upload || false}
                    onCheckedChange={(checked) => 
                      setNewTemplate({ ...newTemplate, requires_file_upload: checked })
                    }
                  />
                  <Label>Requires file upload</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Step
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No onboarding steps created yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first step to begin setting up client onboarding.
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{template.step_name}</h4>
                        <Badge variant={template.step_type === 'mandatory' ? 'default' : 'secondary'}>
                          {template.step_type}
                        </Badge>
                        <Badge variant="outline">
                          {template.completion_method}
                        </Badge>
                        {template.requires_file_upload && (
                          <Badge variant="outline">file upload</Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) => 
                          handleUpdateTemplate(template.id, { is_active: checked })
                        }
                      />
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}