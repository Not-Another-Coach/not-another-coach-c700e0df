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
import { usePackageWaysOfWorking } from '@/hooks/usePackageWaysOfWorking';
import { toast } from 'sonner';
import { useTrainerActivities } from '@/hooks/useTrainerActivities';

export function ClientOnboardingManagement() {
  const { 
    templates, 
    loading, 
    createTemplate, 
    updateTemplate
  } = useTrainerOnboarding();
  
  const { packageWorkflows, loading: workflowsLoading } = usePackageWaysOfWorking();
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities, createActivity } = useTrainerActivities();
  
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
  const [showCreateActivityDialog, setShowCreateActivityDialog] = useState(false);
  const [newActivity, setNewActivity] = useState<{ name: string; category: string; description: string }>({
    name: '',
    category: 'Onboarding',
    description: '',
  });
  if (loading || workflowsLoading) {
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

  const handleCreateActivity = async () => {
    if (!newActivity.name.trim()) {
      toast.error('Activity name is required');
      return;
    }
    const result: any = await createActivity(
      newActivity.name.trim(),
      newActivity.category,
      newActivity.description.trim() || null
    );
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Activity created');
      setShowCreateActivityDialog(false);
      setNewActivity({ name: '', category: 'Onboarding', description: '' });
      refreshActivities();
    }
  };

  const renderWaysOfWorkingOverview = () => {
    if (!packageWorkflows || packageWorkflows.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No package workflows found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set up your Ways of Working in the profile setup to see the breakdown here.
          </p>
        </div>
      );
    }

    const sections = [
      { 
        title: 'Getting Started', 
        items: [
          { name: 'Onboarding Process', key: 'onboarding_items' },
          { name: 'What I Bring', key: 'what_i_bring_items' }
        ]
      },
      { 
        title: 'First Week', 
        items: [
          { name: 'First Week Structure', key: 'first_week_items' }
        ]
      },
      { 
        title: 'Ongoing Structure', 
        items: [
          { name: 'Ongoing Process', key: 'ongoing_structure_items' },
          { name: 'Tracking Tools', key: 'tracking_tools_items' },
          { name: 'Client Expectations', key: 'client_expectations_items' }
        ]
      }
    ];

    // Collect all unique action items across all packages and sections
    const allActionItems: Array<{
      header1: string;
      header2: string;
      actionItem: string;
      description?: string;
      packages: { [packageName: string]: boolean };
    }> = [];

    sections.forEach(section => {
      section.items.forEach(item => {
        const itemsAcrossPackages: { [actionItem: string]: { packages: string[]; description?: string } } = {};
        
        // Collect items from all packages for this section/item combination
        packageWorkflows.forEach(workflow => {
          const items = (workflow[item.key as keyof typeof workflow] as any[]) || [];
          items.forEach((listItem: any) => {
            const actionText = typeof listItem === 'string' ? listItem : listItem.text;
            const description = typeof listItem === 'object' ? listItem.description : undefined;
            
            if (!itemsAcrossPackages[actionText]) {
              itemsAcrossPackages[actionText] = { packages: [], description };
            }
            itemsAcrossPackages[actionText].packages.push(workflow.package_name);
          });
        });

        // Convert to our format
        Object.entries(itemsAcrossPackages).forEach(([actionText, data]) => {
          const packageFlags: { [packageName: string]: boolean } = {};
          packageWorkflows.forEach(workflow => {
            packageFlags[workflow.package_name] = data.packages.includes(workflow.package_name);
          });

          allActionItems.push({
            header1: section.title,
            header2: item.name,
            actionItem: actionText,
            description: data.description,
            packages: packageFlags
          });
        });
      });
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left p-3 font-semibold bg-muted/50">Category</th>
              <th className="text-left p-3 font-semibold bg-muted/50">Section</th>
              <th className="text-left p-3 font-semibold bg-muted/50">Action Item</th>
              <th className="text-left p-3 font-semibold bg-muted/50">Description</th>
              {packageWorkflows.map(workflow => (
                <th key={workflow.id} className="text-center p-3 font-semibold bg-primary/10 min-w-24">
                  {workflow.package_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allActionItems.length === 0 ? (
              <tr>
                <td colSpan={4 + packageWorkflows.length} className="text-center py-8 text-muted-foreground">
                  No action items found. Add items to your Ways of Working sections.
                </td>
              </tr>
            ) : (
              allActionItems.map((item, index) => {
                const isFirstInSection = index === 0 || allActionItems[index - 1].header1 !== item.header1;
                const isFirstInSubsection = index === 0 || 
                  allActionItems[index - 1].header1 !== item.header1 || 
                  allActionItems[index - 1].header2 !== item.header2;
                
                return (
                  <tr key={index} className="border-b border-border hover:bg-muted/20">
                    <td className="p-3 font-medium text-primary">
                      {isFirstInSection ? item.header1 : ''}
                    </td>
                    <td className="p-3 font-medium">
                      {isFirstInSubsection ? item.header2 : ''}
                    </td>
                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{item.actionItem}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {item.description || '-'}
                    </td>
                    {packageWorkflows.map(workflow => (
                      <td key={workflow.id} className="text-center p-3">
                        {item.packages[workflow.package_name] ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 border border-muted-foreground/30 rounded-full mx-auto"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Template Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workflows">Ways of Working Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Reusable Activities</h3>
              <Dialog open={showCreateActivityDialog} onOpenChange={setShowCreateActivityDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Activity
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Activity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        placeholder="e.g., Kickoff Questionnaire"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newActivity.category}
                        onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Onboarding">Onboarding</SelectItem>
                          <SelectItem value="First Week">First Week</SelectItem>
                          <SelectItem value="Ongoing Structure">Ongoing Structure</SelectItem>
                          <SelectItem value="Tracking Tools">Tracking Tools</SelectItem>
                          <SelectItem value="Client Expectations">Client Expectations</SelectItem>
                          <SelectItem value="What I Bring">What I Bring</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        placeholder="Optional: add helpful context for this activity"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateActivityDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateActivity}>Create</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {activitiesLoading ? (
              <div className="text-sm text-muted-foreground py-8">Loading activities...</div>
            ) : activitiesError ? (
              <div className="text-sm text-destructive py-8">{activitiesError}</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No activities yet.</div>
            ) : (
              <div className="grid gap-4">
                {activities.map((a, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <h4 className="font-medium whitespace-nowrap">{a.activity_name}</h4>
          {a.description && (
            <span className="text-sm text-muted-foreground truncate flex-1">— {a.description}</span>
          )}
          <Badge variant="outline">{a.category}</Badge>
          {a.is_system && (
            <Badge variant="secondary">System</Badge>
          )}
        </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Assign</Button>
                          <Button variant="ghost" size="sm" disabled={a.is_system}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ways of Working Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {renderWaysOfWorkingOverview()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}