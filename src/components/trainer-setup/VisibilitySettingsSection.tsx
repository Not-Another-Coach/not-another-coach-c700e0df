import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Lock, Settings, ExternalLink } from 'lucide-react';
import { useVisibilityMatrix, ContentType, VisibilityState, EngagementStageGroup } from '@/hooks/useVisibilityMatrix';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useTrainerProfile } from '@/hooks/useTrainerProfile';
import { ProfilePreviewModal } from './ProfilePreviewModal';
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
  hidden: { label: 'Hidden', icon: Lock, color: 'text-red-500' },
  blurred: { label: 'Blurred', icon: EyeOff, color: 'text-yellow-500' },
  visible: { label: 'Visible', icon: Eye, color: 'text-green-500' }
};

export const VisibilitySettingsSection = () => {
  const { profile } = useTrainerProfile();
  const { updateVisibilityByGroup, initializeDefaults, loading } = useVisibilityMatrix();
  const [settings, setSettings] = useState<Record<string, VisibilityState>>({});
  const [hasInitialized, setHasInitialized] = useState(false);
  const [previewStage, setPreviewStage] = useState<EngagementStageGroup | null>(null);

  // Only show admin-controllable content types in trainer setup
  const adminControllableTypes: ContentType[] = [
    'profile_image',
    'basic_information',
    'testimonial_images',
    'gallery_images',
    'pricing_discovery_call'
  ];

  const stageGroups: EngagementStageGroup[] = [
    'browsing',
    'liked',
    'shortlisted',
    'discovery_process',
    'committed',
    'rejected'
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
    stageGroup: EngagementStageGroup,
    newVisibility: VisibilityState
  ) => {
    if (!profile?.id) return;

    const key = `${contentType}-${stageGroup}`;
    setSettings(prev => ({ ...prev, [key]: newVisibility }));

    const { error } = await updateVisibilityByGroup(
      profile.id, 
      contentType, 
      stageGroup, 
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

  if (!profile) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Content Visibility Matrix
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control what content clients can see at each engagement stage group
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasInitialized && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Button onClick={initializeSettings} disabled={loading}>
                Initialize Default Settings
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will set up recommended visibility settings for each engagement stage group
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Content Type</th>
                  {stageGroups.map(stageGroup => (
                    <th key={stageGroup} className="text-center p-2 border-b min-w-[140px]">
                      <div className="space-y-2">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewStage(stageGroup)}
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
              {adminControllableTypes.map(contentType => (
                <tr key={contentType} className="border-b">
                  <td className="p-2 font-medium text-sm">
                    {contentTypeLabels[contentType]}
                  </td>
                  {stageGroups.map(stageGroup => {
                    const key = `${contentType}-${stageGroup}`;
                    const currentValue = settings[key] || 'hidden';
                    
                    return (
                      <td key={stageGroup} className="p-2 text-center">
                        <Select
                          value={currentValue}
                          onValueChange={(value: VisibilityState) => 
                            handleVisibilityChange(contentType, stageGroup, value)
                          }
                        >
                          <SelectTrigger className="w-28 h-8">
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
            stage={previewStage === 'browsing' ? 'browsing' : 
                   previewStage === 'liked' ? 'liked' :
                   previewStage === 'shortlisted' ? 'shortlisted' :
                   previewStage === 'discovery_process' ? 'discovery_in_progress' :
                   previewStage === 'committed' ? 'active_client' : 'declined'}
          />
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};