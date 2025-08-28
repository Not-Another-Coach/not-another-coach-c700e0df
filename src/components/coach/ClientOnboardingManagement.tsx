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
import { TemplateManagementTabs } from '@/components/coach/TemplateManagementTabs';
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
        <TemplateManagementTabs />
    </Card>
  );
}
    </Card>
  );
}