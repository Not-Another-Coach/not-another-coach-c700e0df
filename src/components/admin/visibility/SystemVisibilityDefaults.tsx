import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';
import { ContentType, VisibilityState, EngagementStageGroup } from '@/hooks/useVisibilityMatrix';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const contentTypeLabels: Record<ContentType, string> = {
  profile_image: 'Profile Image',
  basic_information: 'Basic Information',
  testimonial_images: 'Testimonial Before/After Photos',
  gallery_images: 'Gallery Images',
  specializations: 'Specializations',
  pricing_discovery_call: 'Pricing & Discovery Call',
  stats_ratings: 'Stats & Ratings',
  description_bio: 'Description & Bio',
  certifications_qualifications: 'Certifications & Qualifications',
  professional_journey: 'Professional Journey',
  professional_milestones: 'Professional Milestones'
};

const stageGroupLabels: Record<EngagementStageGroup, { label: string; tooltip: string }> = {
  browsing: { 
    label: 'Browsing', 
    tooltip: 'When clients are browsing trainer profiles' 
  },
  liked: { 
    label: 'Liked', 
    tooltip: 'When clients have liked a trainer profile' 
  },
  shortlisted: { 
    label: 'Shortlisted', 
    tooltip: 'When clients have shortlisted a trainer' 
  },
  discovery_process: { 
    label: 'Discovery Process', 
    tooltip: 'Getting to Know, Discovery Active, Matched' 
  },
  committed: { 
    label: 'Committed', 
    tooltip: 'Discovery Done, Agreed, Payment Pending, Active Client' 
  },
  rejected: { 
    label: 'Rejected', 
    tooltip: 'Unmatched, Declined, Previously Declined' 
  }
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

  // Admin controllable content types
  const adminControllableTypes: ContentType[] = [
    'profile_image',
    'basic_information',
    'testimonial_images',
    'gallery_images',
    'pricing_discovery_call'
  ];

  // Default visible (not editable by admin)
  const defaultVisibleTypes: ContentType[] = [
    'specializations',
    'description_bio',
    'certifications_qualifications',
    'professional_journey',
    'professional_milestones'
  ];

  // Always visible (not amendable)
  const alwaysVisibleTypes: ContentType[] = [
    'stats_ratings'
  ];

  const allContentTypes: ContentType[] = [
    ...adminControllableTypes,
    ...defaultVisibleTypes,
    ...alwaysVisibleTypes
  ];

  const stageGroups: EngagementStageGroup[] = [
    'browsing',
    'liked',
    'shortlisted',
    'discovery_process',
    'committed',
    'rejected'
  ];

  useEffect(() => {
    loadDefaultSettings();
  }, []);

  const loadDefaultSettings = async () => {
    setLoading(true);
    try {
      // For now, use hardcoded defaults - this will be replaced with API call
      const defaults: Record<string, VisibilityState> = {};
      allContentTypes.forEach(contentType => {
        stageGroups.forEach(stageGroup => {
          const key = `${contentType}_${stageGroup}`;
          // Set sensible defaults based on content type category
          if (alwaysVisibleTypes.includes(contentType)) {
            defaults[key] = 'visible';
          } else if (defaultVisibleTypes.includes(contentType)) {
            defaults[key] = 'visible';
          } else if (adminControllableTypes.includes(contentType)) {
            // Set engagement-based defaults for admin controllable types
            if (stageGroup === 'committed') {
              defaults[key] = 'visible';
            } else if (stageGroup === 'browsing') {
              defaults[key] = ['profile_image', 'basic_information', 'pricing_discovery_call'].includes(contentType) ? 'visible' : 'blurred';
            } else if (['shortlisted', 'discovery_process'].includes(stageGroup)) {
              defaults[key] = contentType === 'testimonial_images' ? 'visible' : 'blurred';
            } else {
              defaults[key] = 'hidden';
            }
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

  const handleVisibilityChange = (contentType: ContentType, stageGroup: EngagementStageGroup, visibility: VisibilityState) => {
    const key = `${contentType}_${stageGroup}`;
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
    <TooltipProvider>
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
                  {stageGroups.map(stageGroup => (
                    <th key={stageGroup} className="text-center p-2 border-b font-medium min-w-[140px]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-medium">
                          {stageGroupLabels[stageGroup].label}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{stageGroupLabels[stageGroup].tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            <tbody>
              {/* Admin Controllable Content Types */}
              {adminControllableTypes.map(contentType => (
                <tr key={contentType} className="hover:bg-muted/50">
                  <td className="p-3 border-b font-medium">
                    <div className="flex items-center gap-2">
                      {contentTypeLabels[contentType]}
                      <Badge variant="outline" className="text-xs">Editable</Badge>
                    </div>
                  </td>
                  {stageGroups.map(stageGroup => {
                    const key = `${contentType}_${stageGroup}`;
                    const currentValue = defaultSettings[key] || 'hidden';
                    
                    return (
                      <td key={stageGroup} className="p-2 border-b text-center">
                        <Select
                          value={currentValue}
                          onValueChange={(value: VisibilityState) => 
                            handleVisibilityChange(contentType, stageGroup, value)
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
              
              {/* Default Visible Content Types (Not Editable) */}
              {defaultVisibleTypes.map(contentType => (
                <tr key={contentType} className="bg-muted/20">
                  <td className="p-3 border-b font-medium">
                    <div className="flex items-center gap-2">
                      {contentTypeLabels[contentType]}
                      <Badge variant="secondary" className="text-xs">Default Visible</Badge>
                    </div>
                  </td>
                  {stageGroups.map(stageGroup => (
                    <td key={stageGroup} className="p-2 border-b text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <VisibilityIcon state="visible" />
                        <span>Visible</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Always Visible Content Types (Not Amendable) */}
              {alwaysVisibleTypes.map(contentType => (
                <tr key={contentType} className="bg-green-50/50 dark:bg-green-950/20">
                  <td className="p-3 border-b font-medium">
                    <div className="flex items-center gap-2">
                      {contentTypeLabels[contentType]}
                      <Badge variant="default" className="text-xs bg-green-600">Always Visible</Badge>
                    </div>
                  </td>
                  {stageGroups.map(stageGroup => (
                    <td key={stageGroup} className="p-2 border-b text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                        <VisibilityIcon state="visible" />
                        <span>Always</span>
                      </div>
                    </td>
                  ))}
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
    </TooltipProvider>
  );
}