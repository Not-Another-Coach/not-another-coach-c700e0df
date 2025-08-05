import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Lock, Settings, ExternalLink } from 'lucide-react';
import { useVisibilityMatrix, ContentType, VisibilityState, EngagementStage } from '@/hooks/useVisibilityMatrix';
import { useProfile } from '@/hooks/useProfile';
import { ProfilePreviewModal } from './ProfilePreviewModal';
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
  matched: 'Matched',
  discovery_completed: 'Discovery Done',
  active_client: 'Active Client',
  unmatched: 'Unmatched',
  declined: 'Declined'
};

const visibilityStateLabels: Record<VisibilityState, { label: string; icon: any; color: string }> = {
  hidden: { label: 'Hidden', icon: Lock, color: 'text-red-500' },
  blurred: { label: 'Blurred', icon: EyeOff, color: 'text-yellow-500' },
  visible: { label: 'Visible', icon: Eye, color: 'text-green-500' }
};

export const VisibilitySettingsSection = () => {
  const { profile } = useProfile();
  const { updateVisibilitySettings, initializeDefaults, loading } = useVisibilityMatrix();
  const [settings, setSettings] = useState<Record<string, VisibilityState>>({});
  const [hasInitialized, setHasInitialized] = useState(false);
  const [previewStage, setPreviewStage] = useState<EngagementStage | null>(null);

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
    'matched', 
    'discovery_completed', 
    'active_client'
  ];

  const initializeSettings = async () => {
    if (!profile?.id || hasInitialized) return;

    const { error } = await initializeDefaults(profile.id);
    if (error) {
      toast.error('Failed to initialize visibility settings');
    } else {
      setHasInitialized(true);
      toast.success('Visibility settings initialized with defaults');
    }
  };

  const handleVisibilityChange = async (
    contentType: ContentType,
    stage: EngagementStage,
    newVisibility: VisibilityState
  ) => {
    if (!profile?.id) return;

    const key = `${contentType}-${stage}`;
    setSettings(prev => ({ ...prev, [key]: newVisibility }));

    const { error } = await updateVisibilitySettings(
      profile.id, 
      contentType, 
      stage, 
      newVisibility
    );

    if (error) {
      toast.error('Failed to update visibility setting');
      // Revert the change on error
      setSettings(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } else {
      toast.success('Visibility setting updated');
    }
  };

  const VisibilityIcon = ({ state }: { state: VisibilityState }) => {
    const config = visibilityStateLabels[state];
    const IconComponent = config.icon;
    return <IconComponent className={`w-4 h-4 ${config.color}`} />;
  };

  if (!profile || profile.user_type !== 'trainer') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Content Visibility Matrix
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Control what content clients can see at each stage of engagement
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasInitialized && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Button onClick={initializeSettings} disabled={loading}>
              Initialize Default Settings
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will set up recommended visibility settings for each engagement stage
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b">Content Type</th>
                {engagementStages.map(stage => (
                  <th key={stage} className="text-center p-2 border-b">
                    <div className="space-y-2">
                      <div className="text-xs font-medium">
                        {engagementStageLabels[stage]}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewStage(stage)}
                        className="h-7 text-xs px-2"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contentTypes.map(contentType => (
                <tr key={contentType} className="border-b">
                  <td className="p-2 font-medium text-sm">
                    {contentTypeLabels[contentType]}
                  </td>
                  {engagementStages.map(stage => {
                    const key = `${contentType}-${stage}`;
                    const currentValue = settings[key] || 'hidden';
                    
                    return (
                      <td key={stage} className="p-2 text-center">
                        <Select
                          value={currentValue}
                          onValueChange={(value: VisibilityState) => 
                            handleVisibilityChange(contentType, stage, value)
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue>
                              <div className="flex items-center gap-1">
                                <VisibilityIcon state={currentValue} />
                                <span className="text-xs">
                                  {visibilityStateLabels[currentValue].label}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(visibilityStateLabels).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <config.icon className={`w-4 h-4 ${config.color}`} />
                                  {config.label}
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

        <div className="bg-primary/5 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Visibility Guide:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span><strong>Hidden:</strong> Content not shown</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-yellow-500" />
              <span><strong>Blurred:</strong> Content shown but blurred</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              <span><strong>Visible:</strong> Content fully visible</span>
            </div>
          </div>
        </div>

        {/* Profile Preview Modal */}
        {previewStage && (
          <ProfilePreviewModal
            isOpen={!!previewStage}
            onClose={() => setPreviewStage(null)}
            trainer={profile}
            stage={previewStage}
          />
        )}
      </CardContent>
    </Card>
  );
};