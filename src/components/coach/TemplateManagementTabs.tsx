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
import { useEnhancedActivities } from '@/hooks/useEnhancedActivities';
import { EnhancedActivityBuilder } from '@/components/onboarding/EnhancedActivityBuilder';
import { EnhancedActivity } from '@/hooks/useEnhancedActivities';
import { TemplateBuilder } from '@/components/onboarding/TemplateBuilder';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { WaysOfWorkingOverview } from '@/components/onboarding/WaysOfWorkingOverview';
import { useUserRoles } from '@/hooks/useUserRoles';

export function TemplateManagementTabs() {
  const {
    templates, 
    loading, 
    createTemplate, 
    updateTemplate
  } = useTrainerOnboarding();
  
  const { packageWorkflows, loading: workflowsLoading } = usePackageWaysOfWorking();
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities, createActivity, updateActivity, updateActivityDetails } = useTrainerActivities();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  
  const { 
    activities: enhancedActivities, 
    loading: enhancedLoading, 
    createActivity: createEnhancedActivity, 
    updateActivity: updateEnhancedActivity,
    refresh: refreshEnhanced
  } = useEnhancedActivities(isAdmin);
  
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
  const [showEnhancedActivityBuilder, setShowEnhancedActivityBuilder] = useState(false);
  const [editingEnhancedActivity, setEditingEnhancedActivity] = useState<EnhancedActivity | null>(null);
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

  // Combine legacy and enhanced activities with proper typing
  type CombinedActivity = {
    id: string;
    activity_name: string;
    category: string;
    description?: string;
    is_system: boolean;
    isEnhanced: boolean;
    guidance_html?: string;
    default_due_days?: number;
    default_sla_days?: number;
    activity_type?: string;
    completion_method?: string;
    requires_file_upload?: boolean;
    trainerName?: string;
    trainer_id?: string;
  };

  const allActivities: CombinedActivity[] = [
    ...(isAdmin ? [] : activities.map(a => ({ 
      ...a, 
      isEnhanced: false,
      activity_type: undefined,
      completion_method: undefined,
      requires_file_upload: undefined,
      trainerName: 'Current User'
    }))),
    ...enhancedActivities.map(a => ({ 
      ...a, 
      activity_name: a.activity_name || 'Unnamed Activity',
      isEnhanced: true, 
      is_system: a.is_system || false,
      trainerName: a.is_system ? 'System' : (a.profiles ? `${a.profiles.first_name} ${a.profiles.last_name}` : 'Unknown Trainer')
    }))
  ];
  
  // Group activities by trainer for admin view (not needed for system activities)
  const groupedActivities = null;

  const categories = Array.from(new Set(allActivities.map((a) => a.category))).sort();
  const filteredActivities = allActivities.filter((a) => {
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

  const handleCreateEnhancedActivity = async (activity: Partial<EnhancedActivity>) => {
    try {
      await createEnhancedActivity(activity);
      setShowEnhancedActivityBuilder(false);
      toast.success('Enhanced activity created successfully');
      refreshEnhanced();
    } catch (error) {
      toast.error('Failed to create enhanced activity');
    }
  };

  const handleUpdateEnhancedActivity = async (activity: Partial<EnhancedActivity>) => {
    if (!editingEnhancedActivity) return;
    
    try {
      await updateEnhancedActivity(editingEnhancedActivity.id, activity);
      setShowEnhancedActivityBuilder(false);
      setEditingEnhancedActivity(null);
      toast.success('Enhanced activity updated successfully');
      refreshEnhanced();
    } catch (error) {
      toast.error('Failed to update enhanced activity');
    }
  };

  const openEnhancedActivityEditor = (activity: EnhancedActivity) => {
    setEditingEnhancedActivity(activity);
    setShowEnhancedActivityBuilder(true);
  };

  if (loading || workflowsLoading || enhancedLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
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
      refreshEnhanced();
    }
  };

  const openEditActivity = (a: any) => {
    // If it's an enhanced activity or admin editing system activity, use enhanced builder
    if (a.isEnhanced || (a.is_system && isAdmin)) {
      const enhancedActivity: EnhancedActivity = {
        id: a.id,
        activity_name: a.activity_name,
        category: a.category,
        description: a.description || '',
        activity_type: a.activity_type || 'task',
        completion_method: a.completion_method || 'client',
        requires_file_upload: a.requires_file_upload || false,
        guidance_html: a.guidance_html || '',
        default_due_days: a.default_due_days || null,
        default_sla_days: a.default_sla_days || null,
        appointment_config: a.appointment_config || {},
        survey_config: a.survey_config || {},
        content_config: a.content_config || {},
        upload_config: a.upload_config || {}
      };
      setEditingEnhancedActivity(enhancedActivity);
      setShowEnhancedActivityBuilder(true);
    } else {
      // Use legacy dialog for basic activities
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
    }
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
      refreshEnhanced();
    }
  };

  return (
    <Tabs defaultValue="activities" className="space-y-4">
      <TabsList>
        <TabsTrigger value="activities">Activities</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="workflows">Ways of Working</TabsTrigger>
      </TabsList>

      <TabsContent value="activities" className="space-y-4">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {isAdmin ? 'System Activities Management' : 'Reusable Activities'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin 
                ? 'Create and manage system activities that all trainers can use'
                : 'Activities you can assign to clients in different templates'
              }
            </p>
          </div>
          <Button
            onClick={() => setShowEnhancedActivityBuilder(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isAdmin ? 'Create System Activity' : 'Create Activity'}
          </Button>
        </div>

        {/* Filtering Controls - only show for non-admin */}
        {!isAdmin && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(value: 'all' | 'system' | 'trainer') => setTypeFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="trainer">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-sm"
            />
          </div>
        )}

        {/* Activities List - Simple list for both admin and regular users */}
        <div className="space-y-4">
          {(activitiesLoading || enhancedLoading) ? (
            <div className="text-center py-8">Loading activities...</div>
          ) : activitiesError ? (
            <div className="text-center py-8 text-red-600">Error loading activities: {activitiesError}</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isAdmin ? 'No system activities found.' : 'No activities found.'}
            </div>
          ) : (
            filteredActivities.map((a) => (
              <Card key={a.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">{a.activity_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={a.is_system ? 'secondary' : 'default'}>
                          {a.is_system ? 'System' : 'Custom'}
                        </Badge>
                        <Badge variant="outline">{a.category}</Badge>
                         {a.isEnhanced && (
                           <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                             {a.activity_type ? a.activity_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Enhanced'}
                           </Badge>
                         )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditActivity(a)}
                        disabled={!isAdmin && a.is_system}
                        title={!isAdmin && a.is_system ? 'System activities can only be edited by administrators' : 'Edit activity'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!a.is_system && !isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* Delete functionality removed for system activities */}}
                          className="text-destructive hover:text-destructive"
                          disabled
                          title="Delete functionality not available"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {a.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                    {a.isEnhanced && a.activity_type && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <strong>Type:</strong> {a.activity_type} | 
                        <strong> Completion:</strong> {a.completion_method || 'client'}
                        {a.requires_file_upload && ' | File upload required'}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        <EnhancedActivityBuilder
          isOpen={showEnhancedActivityBuilder}
          onClose={() => {
            setShowEnhancedActivityBuilder(false);
            setEditingEnhancedActivity(null);
          }}
          onSave={editingEnhancedActivity ? handleUpdateEnhancedActivity : handleCreateEnhancedActivity}
          activity={editingEnhancedActivity || undefined}
          isEditing={!!editingEnhancedActivity}
        />
        
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
                      placeholder="e.g., 14"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditActivityDialog(false)}>Cancel</Button>
                  <Button onClick={handleUpdateActivity}>Update</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <TemplateBuilder 
          templates={builderTemplates}
          onCreateTemplate={builderCreateTemplate}
          onUpdateTemplate={builderUpdateTemplate}
          onDuplicateTemplate={duplicateTemplate}
          onReorderTemplates={reorderTemplates}
        />
      </TabsContent>

      <TabsContent value="workflows" className="space-y-4">
        <WaysOfWorkingOverview />
      </TabsContent>
    </Tabs>
  );
}