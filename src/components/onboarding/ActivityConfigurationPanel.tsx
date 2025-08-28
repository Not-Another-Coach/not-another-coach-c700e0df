import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export type ActivityType = 'task' | 'appointment' | 'survey' | 'training_content' | 'file_upload';

interface ActivityConfig {
  appointment_config?: {
    duration_minutes?: number;
    requires_meeting_link?: boolean;
    calendar_integration?: boolean;
    default_meeting_link?: string;
  };
  survey_config?: {
    survey_url: string;
    completion_webhook?: string;
    requires_confirmation?: boolean;
  };
  content_config?: {
    content_url: string;
    content_type: 'video' | 'image' | 'document';
    estimated_duration_minutes?: number;
    requires_completion_tracking?: boolean;
  };
  upload_config?: {
    uploader: 'client' | 'trainer';
    file_types: string[];
    max_files: number;
    max_file_size_mb: number;
    upload_instructions?: string;
  };
}

interface ActivityConfigurationPanelProps {
  activityType: ActivityType;
  config: ActivityConfig;
  onConfigChange: (config: ActivityConfig) => void;
}

export const ActivityConfigurationPanel = ({ 
  activityType, 
  config, 
  onConfigChange 
}: ActivityConfigurationPanelProps) => {
  const [newFileType, setNewFileType] = useState('');

  const updateConfig = (section: keyof ActivityConfig, updates: any) => {
    onConfigChange({
      ...config,
      [section]: {
        ...config[section],
        ...updates
      }
    });
  };

  const addFileType = () => {
    if (newFileType && config.upload_config) {
      updateConfig('upload_config', {
        file_types: [...(config.upload_config.file_types || []), newFileType]
      });
      setNewFileType('');
    }
  };

  const removeFileType = (typeToRemove: string) => {
    if (config.upload_config) {
      updateConfig('upload_config', {
        file_types: config.upload_config.file_types?.filter(type => type !== typeToRemove) || []
      });
    }
  };

  if (activityType === 'task') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regular Task Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Regular tasks use the standard completion method. Configure file uploads and due dates in the main activity settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (activityType === 'appointment') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={config.appointment_config?.duration_minutes || 60}
              onChange={(e) => updateConfig('appointment_config', { 
                duration_minutes: parseInt(e.target.value) 
              })}
              min="15"
              max="480"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.appointment_config?.requires_meeting_link || false}
              onCheckedChange={(checked) => updateConfig('appointment_config', { 
                requires_meeting_link: checked 
              })}
            />
            <Label>Requires meeting link</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.appointment_config?.calendar_integration || false}
              onCheckedChange={(checked) => updateConfig('appointment_config', { 
                calendar_integration: checked 
              })}
            />
            <Label>Enable calendar integration</Label>
          </div>

          {config.appointment_config?.requires_meeting_link && (
            <div>
              <Label htmlFor="meeting-link">Default Meeting Link (Optional)</Label>
              <Input
                id="meeting-link"
                type="url"
                placeholder="https://zoom.us/j/..."
                value={config.appointment_config?.default_meeting_link || ''}
                onChange={(e) => updateConfig('appointment_config', { 
                  default_meeting_link: e.target.value 
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (activityType === 'survey') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Survey Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="survey-url">Survey URL *</Label>
            <Input
              id="survey-url"
              type="url"
              placeholder="https://forms.google.com/..."
              value={config.survey_config?.survey_url || ''}
              onChange={(e) => updateConfig('survey_config', { 
                survey_url: e.target.value 
              })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.survey_config?.requires_confirmation || false}
              onCheckedChange={(checked) => updateConfig('survey_config', { 
                requires_confirmation: checked 
              })}
            />
            <Label>Requires manual completion confirmation</Label>
          </div>

          <div>
            <Label htmlFor="webhook-url">Completion Webhook URL (Optional)</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-app.com/webhook"
              value={config.survey_config?.completion_webhook || ''}
              onChange={(e) => updateConfig('survey_config', { 
                completion_webhook: e.target.value 
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Webhook to automatically mark survey as complete
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activityType === 'training_content') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Content Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content-url">Content URL *</Label>
            <Input
              id="content-url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={config.content_config?.content_url || ''}
              onChange={(e) => updateConfig('content_config', { 
                content_url: e.target.value 
              })}
              required
            />
          </div>

          <div>
            <Label htmlFor="content-type">Content Type</Label>
            <Select
              value={config.content_config?.content_type || 'video'}
              onValueChange={(value) => updateConfig('content_config', { 
                content_type: value as 'video' | 'image' | 'document' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image/Gallery</SelectItem>
                <SelectItem value="document">Document/PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimated-duration">Estimated Duration (minutes)</Label>
            <Input
              id="estimated-duration"
              type="number"
              value={config.content_config?.estimated_duration_minutes || ''}
              onChange={(e) => updateConfig('content_config', { 
                estimated_duration_minutes: parseInt(e.target.value) || undefined 
              })}
              min="1"
              max="300"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.content_config?.requires_completion_tracking || false}
              onCheckedChange={(checked) => updateConfig('content_config', { 
                requires_completion_tracking: checked 
              })}
            />
            <Label>Track completion automatically</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activityType === 'file_upload') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>File Upload Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Who uploads the files?</Label>
            <Select
              value={config.upload_config?.uploader || 'client'}
              onValueChange={(value) => updateConfig('upload_config', { 
                uploader: value as 'client' | 'trainer' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client uploads</SelectItem>
                <SelectItem value="trainer">Trainer uploads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Allowed File Types</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g., jpg, png, pdf"
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFileType()}
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={addFileType}
                disabled={!newFileType}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.upload_config?.file_types?.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <button 
                    onClick={() => removeFileType(type)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="max-files">Maximum Files</Label>
            <Input
              id="max-files"
              type="number"
              value={config.upload_config?.max_files || 5}
              onChange={(e) => updateConfig('upload_config', { 
                max_files: parseInt(e.target.value) 
              })}
              min="1"
              max="20"
            />
          </div>

          <div>
            <Label htmlFor="max-size">Max File Size (MB)</Label>
            <Input
              id="max-size"
              type="number"
              value={config.upload_config?.max_file_size_mb || 10}
              onChange={(e) => updateConfig('upload_config', { 
                max_file_size_mb: parseInt(e.target.value) 
              })}
              min="1"
              max="100"
            />
          </div>

          <div>
            <Label htmlFor="upload-instructions">Upload Instructions</Label>
            <Textarea
              id="upload-instructions"
              placeholder="Special instructions for file uploads..."
              value={config.upload_config?.upload_instructions || ''}
              onChange={(e) => updateConfig('upload_config', { 
                upload_instructions: e.target.value 
              })}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};