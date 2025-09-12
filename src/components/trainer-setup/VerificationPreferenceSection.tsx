import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, Info } from 'lucide-react';
import { useEnhancedTrainerVerification } from '@/hooks/useEnhancedTrainerVerification';
import { Badge } from '@/components/ui/badge';

export const VerificationPreferenceSection = () => {
  const { overview, updateDisplayPreference, loading } = useEnhancedTrainerVerification();

  const wantsVerification = overview?.display_preference === 'verified_allowed' || overview?.display_preference === undefined;

  const handlePreferenceChange = (checked: boolean) => {
    const preference = checked ? 'verified_allowed' : 'hidden';
    updateDisplayPreference(preference);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Verification Preference
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="verification-preference"
              checked={wantsVerification}
              onCheckedChange={handlePreferenceChange}
              disabled={loading}
            />
            <Label htmlFor="verification-preference" className="text-base font-medium">
              I want my profile to be verified by admin
            </Label>
          </div>
          <Badge variant={wantsVerification ? 'default' : 'secondary'} className="gap-1">
            {wantsVerification ? (
              <>
                <Eye className="w-3 h-3" />
                Verification Enabled
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                Verification Disabled
              </>
            )}
          </Badge>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              {wantsVerification ? (
                <div>
                  <p className="font-medium mb-1">Verification enabled:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li>Professional documents will be submitted to admin for review</li>
                    <li>Verified badge will be displayed when documents are approved</li>
                    <li>Increases client trust and profile credibility</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="font-medium mb-1">Verification disabled:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li>Documents are saved but not sent to admin for review</li>
                    <li>No verified badge will be displayed to clients</li>
                    <li>Documents remain available for client viewing if requested</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {overview?.overall_status && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Status:</span>
              <Badge variant={overview.overall_status === 'verified' ? 'default' : 'secondary'}>
                {overview.overall_status === 'verified' ? 'Verified' : 
                 overview.overall_status === 'expired' ? 'Expired' : 'Not Shown'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};