import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';
import { ContentType, VisibilityState, EngagementStage } from '@/hooks/useVisibilityMatrix';
import { toast } from 'sonner';

const contentTypeLabels: Record<ContentType, string> = {
  profile_image: 'Profile Photo',
  before_after_images: 'Before/After Photos', 
  package_images: 'Package Images',
  testimonial_images: 'Testimonial Photos',
  certification_images: 'Certifications',
  gallery_images: 'Gallery Images'
};

const engagementStageLabels: Record<EngagementStage, string> = {
  browsing: 'Browsing',
  liked: 'Liked', 
  shortlisted: 'Shortlisted',
  getting_to_know_your_coach: 'Getting to Know',
  discovery_in_progress: 'Discovery Active',
  matched: 'Matched',
  discovery_completed: 'Discovery Done',
  agreed: 'Agreed',
  payment_pending: 'Payment Pending',
  active_client: 'Active Client',
  unmatched: 'Unmatched',
  declined: 'Declined',
  declined_dismissed: 'Previously Declined'
};

const visibilityStateLabels: Record<VisibilityState, { label: string; icon: any; color: string }> = {
  hidden: { label: 'Hidden', icon: Lock, color: 'text-destructive' },
  blurred: { label: 'Blurred', icon: EyeOff, color: 'text-warning' },
  visible: { label: 'Visible', icon: Eye, color: 'text-success' }
};

export function SystemVisibilityDefaults() {
  const [defaultSettings, setDefaultSettings] = useState<Record<string, VisibilityState>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const contentTypes: ContentType[] = [
    'profile_image',
    'before_after_images', 
    'package_images',
    'testimonial_images',
    'certification_images',
    'gallery_images'
  ];

  const engagementStages: EngagementStage[] = [
    'browsing',
    'liked',
    'shortlisted', 
    'getting_to_know_your_coach',
    'discovery_in_progress',
    'matched',
    'discovery_completed',
    'agreed',
    'payment_pending',
    'active_client',
    'unmatched',
    'declined',
    'declined_dismissed'
  ];

  useEffect(() => {
    loadDefaultSettings();
  }, []);

  const loadDefaultSettings = async () => {
    setLoading(true);
    try {
      // For now, use hardcoded defaults - this will be replaced with API call
      const defaults: Record<string, VisibilityState> = {};
      contentTypes.forEach(contentType => {
        engagementStages.forEach(stage => {
          const key = `${contentType}_${stage}`;
          // Set sensible defaults
          if (stage === 'active_client') {
            defaults[key] = 'visible';
          } else if (stage === 'browsing') {
            defaults[key] = contentType === 'profile_image' ? 'visible' : 'blurred';
          } else if (['shortlisted', 'discovery_in_progress', 'discovery_completed'].includes(stage)) {
            defaults[key] = contentType === 'before_after_images' ? 'blurred' : 'visible';
          } else {
            defaults[key] = 'hidden';
          }
        });
      });
      setDefaultSettings(defaults);
    } catch (error) {
      console.error('Error loading default settings:', error);
      toast.error('Failed to load default settings');
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = (contentType: ContentType, stage: EngagementStage, visibility: VisibilityState) => {
    const key = `${contentType}_${stage}`;
    setDefaultSettings(prev => ({
      ...prev,
      [key]: visibility
    }));
  };

  const saveDefaults = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save system defaults
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('System default visibility settings saved successfully');
    } catch (error) {
      console.error('Error saving defaults:', error);
      toast.error('Failed to save default settings');
    } finally {
      setSaving(false);
    }
  };

  const VisibilityIcon = ({ state }: { state: VisibilityState }) => {
    const config = visibilityStateLabels[state];
    const IconComponent = config.icon;
    return <IconComponent className={`h-4 w-4 ${config.color}`} />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Visibility Defaults</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Visibility Defaults
          <Button onClick={saveDefaults} disabled={saving} className="ml-4">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Defaults'}
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure the default visibility settings that will be applied to all new trainer profiles.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 border-b font-medium">Content Type</th>
                {engagementStages.map(stage => (
                  <th key={stage} className="text-center p-2 border-b font-medium min-w-[120px]">
                    <div className="text-xs">
                      {engagementStageLabels[stage]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contentTypes.map(contentType => (
                <tr key={contentType} className="hover:bg-muted/50">
                  <td className="p-3 border-b font-medium">
                    {contentTypeLabels[contentType]}
                  </td>
                  {engagementStages.map(stage => {
                    const key = `${contentType}_${stage}`;
                    const currentValue = defaultSettings[key] || 'hidden';
                    
                    return (
                      <td key={stage} className="p-2 border-b text-center">
                        <Select
                          value={currentValue}
                          onValueChange={(value: VisibilityState) => 
                            handleVisibilityChange(contentType, stage, value)
                          }
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue>
                              <div className="flex items-center justify-center gap-1">
                                <VisibilityIcon state={currentValue} />
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(visibilityStateLabels).map(([state, config]) => (
                              <SelectItem key={state} value={state}>
                                <div className="flex items-center gap-2">
                                  <config.icon className={`h-4 w-4 ${config.color}`} />
                                  <span>{config.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Visibility Guide</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(visibilityStateLabels).map(([state, config]) => (
              <div key={state} className="flex items-center gap-2">
                <config.icon className={`h-4 w-4 ${config.color}`} />
                <span className="font-medium">{config.label}:</span>
                <span className="text-muted-foreground">
                  {state === 'hidden' && 'Content is completely hidden'}
                  {state === 'blurred' && 'Content is blurred/preview only'}
                  {state === 'visible' && 'Content is fully visible'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}