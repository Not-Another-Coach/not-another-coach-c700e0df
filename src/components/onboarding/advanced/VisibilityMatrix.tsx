import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Users, 
  UserCheck, 
  FileText,
  Info
} from 'lucide-react';
import { useAdvancedOnboarding } from '@/hooks/useAdvancedOnboarding';
import { toast } from 'sonner';

interface VisibilityMatrixProps {
  sectionType: 'getting_started' | 'ongoing_support' | 'commitments' | 'trainer_notes';
  sectionId: string;
  sectionName: string;
  currentVisibility: {
    visibility_client?: boolean;
    visibility_trainer?: boolean;
    show_in_summary?: boolean;
  };
  onVisibilityChange?: (visibility: {
    visibility_client?: boolean;
    visibility_trainer?: boolean;
    show_in_summary?: boolean;
  }) => void;
}

export function VisibilityMatrix({
  sectionType,
  sectionId,
  sectionName,
  currentVisibility,
  onVisibilityChange
}: VisibilityMatrixProps) {
  const { updateSectionVisibility } = useAdvancedOnboarding();

  const handleVisibilityChange = async (
    key: 'visibility_client' | 'visibility_trainer' | 'show_in_summary',
    value: boolean
  ) => {
    const newVisibility = {
      ...currentVisibility,
      [key]: value
    };

    try {
      await updateSectionVisibility(sectionType, sectionId, { [key]: value });
      onVisibilityChange?.(newVisibility);
    } catch (error) {
      toast.error('Failed to update visibility settings');
    }
  };

  const getVisibilityBadge = () => {
    const { visibility_client, visibility_trainer } = currentVisibility;
    
    if (visibility_client && visibility_trainer) {
      return (
        <Badge variant="default" className="gap-1">
          <Users className="h-3 w-3" />
          Both
        </Badge>
      );
    } else if (visibility_trainer && !visibility_client) {
      return (
        <Badge variant="secondary" className="gap-1">
          <UserCheck className="h-3 w-3" />
          Trainer Only
        </Badge>
      );
    } else if (visibility_client && !visibility_trainer) {
      return (
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          Client Only
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="gap-1">
          <EyeOff className="h-3 w-3" />
          Hidden
        </Badge>
      );
    }
  };

  const getSectionTypeDescription = () => {
    switch (sectionType) {
      case 'getting_started':
        return 'Control who can see tasks and guidance in the Getting Started section.';
      case 'ongoing_support':
        return 'Manage visibility of support settings and communication preferences.';
      case 'commitments':
        return 'Set visibility for commitments and expectations that require acknowledgment.';
      case 'trainer_notes':
        return 'Configure visibility for trainer-specific notes and setup actions.';
      default:
        return 'Control who can see this content and when it appears.';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visibility Settings
          </CardTitle>
          {getVisibilityBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {getSectionTypeDescription()}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Who can see this content?</h4>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="client-visibility"
                checked={currentVisibility.visibility_client ?? true}
                onCheckedChange={(value) => handleVisibilityChange('visibility_client', value)}
              />
              <Label htmlFor="client-visibility" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Visible to Clients
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="trainer-visibility"
                checked={currentVisibility.visibility_trainer ?? true}
                onCheckedChange={(value) => handleVisibilityChange('visibility_trainer', value)}
              />
              <Label htmlFor="trainer-visibility" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Visible to Trainers
              </Label>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="summary-visibility"
                checked={currentVisibility.show_in_summary ?? true}
                onCheckedChange={(value) => handleVisibilityChange('show_in_summary', value)}
              />
              <Label htmlFor="summary-visibility" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Show in Template Summary
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Include this item in template previews and overviews
            </p>
          </div>
        </div>

        {/* Visibility Preview */}
        <div className="space-y-2 pt-3 border-t">
          <h4 className="text-sm font-medium">Preview:</h4>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Clients will:</span>
              <span>
                {currentVisibility.visibility_client ? (
                  <span className="text-green-600">See this content</span>
                ) : (
                  <span className="text-red-600">Not see this content</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Trainers will:</span>
              <span>
                {currentVisibility.visibility_trainer ? (
                  <span className="text-green-600">See this content</span>
                ) : (
                  <span className="text-red-600">Not see this content</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Template summary:</span>
              <span>
                {currentVisibility.show_in_summary ? (
                  <span className="text-green-600">Will include this item</span>
                ) : (
                  <span className="text-muted-foreground">Will exclude this item</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Warning for problematic configurations */}
        {!currentVisibility.visibility_client && !currentVisibility.visibility_trainer && (
          <Alert>
            <EyeOff className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This content is hidden from both clients and trainers. 
              It will effectively be invisible in the onboarding process.
            </AlertDescription>
          </Alert>
        )}

        {sectionType === 'trainer_notes' && currentVisibility.visibility_client && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Trainer notes are typically meant for internal use only. 
              Consider if clients should really see this content.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}