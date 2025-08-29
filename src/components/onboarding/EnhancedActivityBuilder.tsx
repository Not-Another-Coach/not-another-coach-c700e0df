import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ActivityTypeSelector, ActivityType } from './ActivityTypeSelector';
import { ActivityConfigurationPanel } from './ActivityConfigurationPanel';
import { EnhancedActivity } from '@/hooks/useEnhancedActivities';

interface EnhancedActivityBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Partial<EnhancedActivity>) => void;
  activity?: EnhancedActivity;
  isEditing?: boolean;
}

const categories = [
  'Onboarding',
  'First Week', 
  'Ongoing Structure',
  'Tracking Tools',
  'Client Expectations',
  'What I Bring',
  'Assessment',
  'Goal Setting',
  'Planning'
];

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

  // Update form data whenever activity prop changes
  useEffect(() => {
    setFormData({
      activity_name: activity?.activity_name || '',
      description: activity?.description || '',
      category: activity?.category || 'Onboarding',
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
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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