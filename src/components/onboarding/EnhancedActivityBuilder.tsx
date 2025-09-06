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
  
  // Get unique system activity categories (all 13 categories)
  const systemActivityCategories = systemActivities
    .filter(a => a.is_system)
    .map(a => a.category)
    .filter((category, index, arr) => arr.indexOf(category) === index)
    .sort();
    
  // Get mapped ways of working categories (8 categories)
  const waysOfWorkingCategories = categories.map(c => c.activity_category)
    .filter((category, index, arr) => arr.indexOf(category) === index)
    .sort();
    
  // Get category status and information
  const getSystemCategoryInfo = (categoryName: string) => {
    const activityCount = systemActivities.filter(a => a.category === categoryName && a.is_system).length;
    
    return {
      activityCount,
      status: activityCount > 0 ? 'active' : 'inactive'
    };
  };

  const getWaysOfWorkingCategoryInfo = (categoryName: string) => {
    const categoryMapping = categories.find(c => c.activity_category === categoryName);
    const systemActivityCount = systemActivities.filter(a => 
      a.ways_of_working_category === categoryName && a.is_system
    ).length;
    
    return {
      mapping: categoryMapping,
      profileSection: categoryMapping?.profile_section_key ? 
        profileSectionNames[categoryMapping.profile_section_key] || categoryMapping.profile_section_key : 
        null,
      activityCount: systemActivityCount,
      status: categoryMapping ? 
        (systemActivityCount > 0 ? 'complete' : 'mapped') : 
        (systemActivityCount > 0 ? 'unmapped' : 'inactive')
    };
  };

  // Update form data whenever activity prop changes
  useEffect(() => {
    setFormData({
      activity_name: activity?.activity_name || '',
      description: activity?.description || '',
      category: activity?.category || (systemActivityCategories[0] || 'general'),
      ways_of_working_category: activity?.ways_of_working_category || '',
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
  }, [activity, isOpen, systemActivityCategories]);

  const handleSave = () => {
    if (!formData.activity_name?.trim()) return;
    
    // Clean up ways_of_working_category if empty
    const dataToSave = {
      ...formData,
      ways_of_working_category: formData.ways_of_working_category || null
    };
    
    onSave(dataToSave);
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
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Brief description of what this activity involves..."
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Activity Classification & Profile Mapping */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Activity Classification & Profile Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Choose the system category and optionally map to a profile section for client workflow integration.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Activity Category */}
              <div className="space-y-2">
                <Label htmlFor="system-category">System Activity Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData('category', value)}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select system category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {systemActivityCategories.map(category => {
                      const info = getSystemCategoryInfo(category);
                      return (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category}</span>
                            <div className="flex items-center gap-1 ml-2">
                              {info.status === 'active' && (
                                <Badge variant="default" className="text-xs bg-success/10 text-success hover:bg-success/20">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                              {isAdmin && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({info.activityCount})
                                </span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {/* System Category Context Information */}
                {formData.category && (
                  <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">System Category: {formData.category}</div>
                        <div className="text-muted-foreground">
                          Used for internal organization and activity management
                        </div>
                        {isAdmin && (() => {
                          const info = getSystemCategoryInfo(formData.category);
                          return (
                            <div className="text-muted-foreground">
                              {info.activityCount} system {info.activityCount === 1 ? 'activity' : 'activities'} in this category
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ways of Working Category */}
              <div className="space-y-2">
                <Label htmlFor="ways-of-working-category">Ways of Working Category (Optional)</Label>
                <Select
                  value={formData.ways_of_working_category || 'none'}
                  onValueChange={(value) => {
                    console.log('Selected ways of working category:', value);
                    const newValue = value === 'none' ? null : value;
                    console.log('Setting ways_of_working_category to:', newValue);
                    updateFormData('ways_of_working_category', newValue);
                  }}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select ways of working category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">None - Don't map to profile section</span>
                    </SelectItem>
                    {waysOfWorkingCategories.map(category => {
                      const info = getWaysOfWorkingCategoryInfo(category);
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
                              {isAdmin && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({info.activityCount})
                                </span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {/* Ways of Working Category Context Information */}
                {formData.ways_of_working_category ? (
                  <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      {(() => {
                        const info = getWaysOfWorkingCategoryInfo(formData.ways_of_working_category);
                        return (
                          <>
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                              <div className="space-y-1 text-sm">
                                <div className="font-medium">Ways of Working: {formData.ways_of_working_category}</div>
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
                                    {info.activityCount} system {info.activityCount === 1 ? 'activity' : 'activities'} with this mapping
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {info.status === 'unmapped' && (
                              <Alert className="border-warning bg-warning/5">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  This category isn't mapped to a profile section. Activities with this category won't appear in trainer profiles.
                                </AlertDescription>
                              </Alert>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 p-3 border rounded-lg bg-muted/10 border-muted">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <div className="font-medium">No Ways of Working Mapping</div>
                        <div>This activity won't appear in trainer profile sections, but will be available for template building.</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {categoriesError && (
                  <Alert className="border-destructive bg-destructive/5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Failed to load ways of working categories: {categoriesError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          <Separator />

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