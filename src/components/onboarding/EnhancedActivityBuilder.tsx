import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ActivityTypeSelector, ActivityType } from './ActivityTypeSelector';
import { ActivityConfigurationPanel } from './ActivityConfigurationPanel';
import { EnhancedActivity } from '@/hooks/useEnhancedActivities';
import { useWaysOfWorkingCategories } from '@/hooks/useWaysOfWorkingCategories';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useTrainerActivities } from '@/hooks/useTrainerActivities';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface EnhancedActivityBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Partial<EnhancedActivity>) => void;
  activity?: EnhancedActivity;
  isEditing?: boolean;
}

const profileSectionNames: Record<string, string> = {
  'how_i_work': 'How I Work',
  'what_i_provide': 'What I Provide',
  'client_expectations': 'Client Expectations',
  'getting_started': 'Getting Started',
  'first_week': 'First Week',
  'ongoing_support': 'Ongoing Support'
};

const completionMethods = [
  { value: 'client', label: 'Client completes' },
  { value: 'trainer', label: 'Trainer completes' },
  { value: 'auto', label: 'Auto-complete' },
  { value: 'both', label: 'Both parties involved' }
];

export const EnhancedActivityBuilder = ({ 
  isOpen, 
  onClose, 
  onSave, 
  activity, 
  isEditing = false 
}: EnhancedActivityBuilderProps) => {
  const [formData, setFormData] = useState<Partial<EnhancedActivity>>({});
  
  // Dynamic category data
  const { categories, loading: categoriesLoading, error: categoriesError } = useWaysOfWorkingCategories();
  const { isAdmin } = useUserRoles();
  const { activities: systemActivities } = useTrainerActivities();
  
  // Get unique activity categories
  const activityCategories = categories.map(c => c.activity_category)
    .filter((category, index, arr) => arr.indexOf(category) === index)
    .sort();
    
  // Get category mapping info
  const getCategoryInfo = (categoryName: string) => {
    const categoryMapping = categories.find(c => c.activity_category === categoryName);
    const activityCount = systemActivities.filter(a => a.category === categoryName && a.is_system).length;
    
    return {
      mapping: categoryMapping,
      profileSection: categoryMapping?.profile_section_key ? 
        profileSectionNames[categoryMapping.profile_section_key] || categoryMapping.profile_section_key : 
        null,
      activityCount,
      status: categoryMapping ? (activityCount > 0 ? 'complete' : 'mapped') : 'unmapped'
    };
  };

  // Update form data whenever activity prop changes
  useEffect(() => {
    setFormData({
      activity_name: activity?.activity_name || '',
      description: activity?.description || '',
      category: activity?.category || (activityCategories[0] || 'general'),
      activity_type: activity?.activity_type || 'task',
      completion_method: activity?.completion_method || 'client',
      requires_file_upload: activity?.requires_file_upload || false,
      default_due_days: activity?.default_due_days || 7,
      default_sla_days: activity?.default_sla_days || 3,
      instructions: activity?.instructions || '',
      guidance_html: activity?.guidance_html || '',
      appointment_config: activity?.appointment_config || {},
      survey_config: activity?.survey_config || {},
      content_config: activity?.content_config || {},
      upload_config: activity?.upload_config || {
        uploader: 'client',
        file_types: ['jpg', 'png', 'pdf'],
        max_files: 5,
        max_file_size_mb: 10
      }
    });
  }, [activity, isOpen]);

  const handleSave = () => {
    if (!formData.activity_name?.trim()) return;
    
    onSave(formData);
    onClose();
  };

  const updateFormData = (field: keyof EnhancedActivity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (config: any) => {
    setFormData(prev => ({ 
      ...prev, 
      ...config 
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Activity' : 'Create New Activity'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activity-name">Activity Name *</Label>
              <Input
                id="activity-name"
                value={formData.activity_name}
                onChange={(e) => updateFormData('activity_name', e.target.value)}
                placeholder="e.g., Complete initial assessment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Activity Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {activityCategories.map(category => {
                    const info = getCategoryInfo(category);
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center justify-between w-full">
                          <span>{category}</span>
                          <div className="flex items-center gap-1 ml-2">
                            {info.status === 'complete' && (
                              <Badge variant="default" className="text-xs bg-success/10 text-success hover:bg-success/20">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            {info.status === 'mapped' && (
                              <Badge variant="secondary" className="text-xs bg-warning/10 text-warning hover:bg-warning/20">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Mapped
                              </Badge>
                            )}
                            {info.status === 'unmapped' && (
                              <Badge variant="destructive" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Unmapped
                              </Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Category Context Information */}
              {formData.category && (
                <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    {(() => {
                      const info = getCategoryInfo(formData.category);
                      return (
                        <>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div className="space-y-1 text-sm">
                              <div className="font-medium">Category: {formData.category}</div>
                              {info.profileSection ? (
                                <div className="text-muted-foreground">
                                  Maps to: <span className="font-medium">{info.profileSection}</span> profile section
                                </div>
                              ) : (
                                <div className="text-destructive">
                                  ⚠️ Not mapped to any profile section
                                </div>
                              )}
                              {isAdmin && (
                                <div className="text-muted-foreground">
                                  {info.activityCount} system {info.activityCount === 1 ? 'activity' : 'activities'} in this category
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {info.status === 'unmapped' && (
                            <Alert className="border-warning bg-warning/5">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                This category isn't mapped to a profile section. Consider updating the category mappings or selecting a mapped category.
                              </AlertDescription>
                            </Alert>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {categoriesError && (
                <Alert className="border-destructive bg-destructive/5">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Error loading categories: {categoriesError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Brief description of what this activity involves..."
            />
          </div>

          {/* Activity Type Selection */}
          <ActivityTypeSelector
            selectedType={formData.activity_type || 'task'}
            onTypeSelect={(type) => updateFormData('activity_type', type)}
          />

          {/* Type-specific Configuration */}
          <ActivityConfigurationPanel
            activityType={formData.activity_type || 'task'}
            config={{
              appointment_config: formData.appointment_config,
              survey_config: formData.survey_config,
              content_config: formData.content_config,
              upload_config: formData.upload_config
            }}
            onConfigChange={handleConfigChange}
          />

          {/* General Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="completion-method">Completion Method</Label>
              <Select
                value={formData.completion_method}
                onValueChange={(value) => updateFormData('completion_method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {completionMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.requires_file_upload}
                onCheckedChange={(checked) => updateFormData('requires_file_upload', checked)}
              />
              <Label>Requires file upload (traditional)</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due-days">Default Due Days</Label>
              <Input
                id="due-days"
                type="number"
                value={formData.default_due_days}
                onChange={(e) => updateFormData('default_due_days', parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </div>
            
            <div>
              <Label htmlFor="sla-days">Default SLA Days</Label>
              <Input
                id="sla-days"
                type="number"
                value={formData.default_sla_days}
                onChange={(e) => updateFormData('default_sla_days', parseInt(e.target.value))}
                min="1"
                max="30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions for Completion</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => updateFormData('instructions', e.target.value)}
              placeholder="Detailed instructions on how to complete this activity..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="guidance">Rich Guidance (HTML)</Label>
            <Textarea
              id="guidance"
              value={formData.guidance_html}
              onChange={(e) => updateFormData('guidance_html', e.target.value)}
              placeholder="Rich HTML guidance with links, formatting, etc..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.activity_name?.trim()}
          >
            {isEditing ? 'Update Activity' : 'Create Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};