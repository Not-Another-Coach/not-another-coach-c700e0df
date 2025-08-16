import { useRef, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2, Users, User, Settings } from 'lucide-react';
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TemplateBuilder } from '@/components/onboarding/TemplateBuilder';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { WaysOfWorkingOverview } from '@/components/onboarding/WaysOfWorkingOverview';
import { ManualTemplateAssignment } from '@/components/coach/ManualTemplateAssignment';
import { ClientTemplateAssignment } from '@/components/coach/ClientTemplateAssignment';
import { ActiveClientsSection } from '@/components/coach/ActiveClientsSection';
import { ClientOnboardingTracker } from '@/components/coach/ClientOnboardingTracker';

export function ClientOnboardingManagement() {
  const {
    templates, 
    loading, 
    createTemplate, 
    updateTemplate
  } = useTrainerOnboarding();
  
  const { packageWorkflows, loading: workflowsLoading } = usePackageWaysOfWorking();
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities, createActivity, updateActivity, updateActivityDetails } = useTrainerActivities();
  const { user } = useAuth();
  
  // Enhanced template builder functionality
  const {
    templates: builderTemplates,
    packageLinks,
    loading: builderLoading,
    createTemplate: builderCreateTemplate,
    updateTemplate: builderUpdateTemplate,
    duplicateTemplate,
    deleteTemplate,
    reorderTemplates,
    publishTemplate,
    archiveTemplate,
    linkToPackage,
    unlinkFromPackage,
    fetchTemplates: refreshTemplates
  } = useTemplateBuilder();
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
  const [showEditActivityDialog, setShowEditActivityDialog] = useState(false);
  const [editActivity, setEditActivity] = useState<{ id: string; name: string; category: string; description: string | null; guidance_html?: string | null; default_due_days?: number | null; default_sla_days?: number | null } | null>(null);
  const quillRef = useRef<ReactQuill | null>(null);
  // Filters for Activities
  const [typeFilter, setTypeFilter] = useState<'all' | 'system' | 'trainer'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = Array.from(new Set(activities.map((a) => a.category))).sort();
  const filteredActivities = activities.filter((a) => {
    if (typeFilter === 'system' && !a.is_system) return false;
    if (typeFilter === 'trainer' && a.is_system) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      const name = a.activity_name.toLowerCase();
      const desc = (a.description || '').toLowerCase();
      if (!name.includes(q) && !desc.includes(q)) return false;
    }
    return true;
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

  const openEditActivity = (a: any) => {
    setEditActivity({
      id: a.id,
      name: a.activity_name,
      category: a.category,
      description: a.description ?? '',
      guidance_html: a.guidance_html ?? '',
      default_due_days: a.default_due_days ?? null,
      default_sla_days: a.default_sla_days ?? null,
    });
    setShowEditActivityDialog(true);
  };

  const handleUpdateActivity = async () => {
    if (!editActivity) return;
    if (!editActivity.name.trim()) {
      toast.error('Activity name is required');
      return;
    }

    const result: any = await updateActivityDetails(
      editActivity.id,
      {
        name: editActivity.name.trim(),
        category: editActivity.category,
        description: (editActivity.description ?? '').trim() || null,
        guidance_html: (editActivity.guidance_html ?? '').toString(),
        default_due_days: editActivity.default_due_days ?? null,
        default_sla_days: editActivity.default_sla_days ?? null,
      }
    );

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Activity updated');
      setShowEditActivityDialog(false);
      setEditActivity(null);
      refreshActivities();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Template Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assign" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assign">Assign Templates</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workflows">Ways of Working</TabsTrigger>
          </TabsList>

          <TabsContent value="assign" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Template Assignment</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <ManualTemplateAssignment />
              </div>
            </div>
          </TabsContent>


          <TabsContent value="activities" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Reusable Activities</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create reusable building blocks that can be imported into template sections. 
                  These activities help standardize your onboarding process across different client packages.
                </p>
              </div>
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
              <Dialog open={showEditActivityDialog} onOpenChange={(open) => { setShowEditActivityDialog(open); if (!open) setEditActivity(null); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Activity</DialogTitle>
                  </DialogHeader>
                  {editActivity && (
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editActivity.name}
                          onChange={(e) => setEditActivity({ ...editActivity, name: e.target.value })}
                          placeholder="Activity name"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={editActivity.category}
                          onValueChange={(value) => setEditActivity({ ...editActivity, category: value })}
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
                          value={editActivity.description ?? ''}
                          onChange={(e) => setEditActivity({ ...editActivity, description: e.target.value })}
                          placeholder="Optional: add helpful context for this activity"
                        />
                      </div>
                      <div>
                        <Label>Guidance (rich text)</Label>
                        <ReactQuill
                          ref={quillRef}
                          theme="snow"
                          value={editActivity.guidance_html ?? ''}
                          onChange={(value) => setEditActivity({ ...editActivity, guidance_html: value })}
                          modules={{
                            toolbar: {
                              container: [
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'header': [1, 2, 3, false] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link', 'image'],
                                ['clean']
                              ],
                              handlers: {
                                image: async () => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = async () => {
                                    const file = (input.files && input.files[0]) || null;
                                    if (!file || !user?.id) return;
                                    const path = `${user.id}/guidance/${crypto.randomUUID()}-${file.name}`;
                                    const { error } = await supabase.storage.from('onboarding-public').upload(path, file, { upsert: false });
                                    if (error) { toast.error('Image upload failed'); return; }
                                    const { data } = supabase.storage.from('onboarding-public').getPublicUrl(path);
                                    const quill = quillRef.current?.getEditor();
                                    const range = quill?.getSelection(true);
                                    if (quill && range) {
                                      quill.insertEmbed(range.index, 'image', data.publicUrl);
                                      quill.setSelection({ index: range.index + 1, length: 0 });
                                    }
                                  };
                                  input.click();
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Default due in (days)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={editActivity.default_due_days ?? ''}
                            onChange={(e) => setEditActivity({ ...editActivity, default_due_days: e.target.value ? parseInt(e.target.value, 10) : null })}
                            placeholder="e.g., 7"
                          />
                        </div>
                        <div>
                          <Label>Default SLA (days)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={editActivity.default_sla_days ?? ''}
                            onChange={(e) => setEditActivity({ ...editActivity, default_sla_days: e.target.value ? parseInt(e.target.value, 10) : null })}
                            placeholder="e.g., 2"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setShowEditActivityDialog(false); setEditActivity(null); }}>Cancel</Button>
                        <Button onClick={handleUpdateActivity}>Save</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <Label htmlFor="activity-search">Search</Label>
                <Input
                  id="activity-search"
                  placeholder="Search name or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | 'system' | 'trainer')}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
                  <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredActivities.length} of {activities.length}
              </div>
            </div>

            {activitiesLoading ? (
              <div className="text-sm text-muted-foreground py-8">Loading activities...</div>
            ) : activitiesError ? (
              <div className="text-sm text-destructive py-8">{activitiesError}</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No activities yet.</div>
            ) : (
              <div className="grid gap-4">
                {filteredActivities.map((a, idx) => (
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={a.is_system}
                            onClick={() => openEditActivity(a)}
                            aria-label="Edit activity"
                          >
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
            <TemplateBuilder
              templates={builderTemplates}
              packages={packageWorkflows.map(pkg => ({ id: pkg.package_id, name: pkg.package_name }))}
              packageLinks={packageLinks}
              onCreateTemplate={builderCreateTemplate}
              onUpdateTemplate={builderUpdateTemplate}
              onDuplicateTemplate={duplicateTemplate}
              onDeleteTemplate={deleteTemplate}
              onReorderTemplates={reorderTemplates}
              onPublishTemplate={publishTemplate}
              onArchiveTemplate={archiveTemplate}
              onLinkToPackage={linkToPackage}
              onUnlinkFromPackage={unlinkFromPackage}
              loading={builderLoading}
            />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <WaysOfWorkingOverview />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}