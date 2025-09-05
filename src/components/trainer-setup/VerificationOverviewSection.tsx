import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle2 } from 'lucide-react';
import { useEnhancedTrainerVerification } from '@/hooks/useEnhancedTrainerVerification';
import { SectionHeader } from './SectionHeader';

const CheckTypeConfig = {
  cimspa_membership: 'CIMSPA Membership',
  insurance_proof: 'Professional Insurance', 
  first_aid_certification: 'First Aid Certification',
};

export const VerificationOverviewSection = () => {
  const {
    loading,
    overview,
    updateDisplayPreference,
    getCheckByType,
    getVerificationBadgeStatus,
  } = useEnhancedTrainerVerification();

  const calculateProgress = () => {
    const requiredChecks = Object.keys(CheckTypeConfig);
    const completedChecks = requiredChecks.filter(type => {
      const check = getCheckByType(type as any);
      return check?.status === 'verified';
    });
    return (completedChecks.length / requiredChecks.length) * 100;
  };

  const badgeStatus = getVerificationBadgeStatus();

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Shield, CheckCircle2]}
        title="Profile Verification"
        description="Complete your profile verification to build trust with potential clients"
      />

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Verification Progress</span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          {/* Document Status Summary */}
          <div className="space-y-2">
            <h4 className="font-medium">Required Documents</h4>
            {Object.entries(CheckTypeConfig).map(([checkType, title]) => {
              const check = getCheckByType(checkType as any);
              const status = check?.status;
              
              let statusColor = 'bg-gray-100 text-gray-800';
              let statusLabel = 'Not Submitted';
              
              if (status === 'pending') {
                statusColor = 'bg-amber-100 text-amber-800';
                statusLabel = 'Under Review';
              } else if (status === 'verified') {
                statusColor = 'bg-emerald-100 text-emerald-800';
                statusLabel = 'Verified';
              } else if (status === 'rejected') {
                statusColor = 'bg-red-100 text-red-800';
                statusLabel = 'Rejected';
              }

              return (
                <div key={checkType} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm font-medium">{title}</span>
                  <Badge className={statusColor}>
                    {statusLabel}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Badge Toggle */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
            <div>
              <h4 className="font-medium">Public Verification Badge</h4>
              <p className="text-sm text-muted-foreground">
                Show "Verified Coach" badge on your public profile when all checks pass
              </p>
            </div>
            <Switch
              checked={overview?.display_preference === 'verified_allowed'}
              onCheckedChange={(checked) =>
                updateDisplayPreference(checked ? 'verified_allowed' : 'hidden')
              }
            />
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Badge Status:</span>
            <Badge variant={badgeStatus === 'verified' ? 'default' : 'secondary'}>
              {badgeStatus === 'verified' ? 'Verified Coach' : 'Not Displayed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-2">Verification Benefits</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Display "Verified Coach" badge on your profile</li>
            <li>• Increased client trust and credibility</li>
            <li>• Higher visibility in search results</li>
            <li>• Access to premium features</li>
          </ul>

          <h4 className="font-medium mt-4 mb-2">Verification Process</h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Submit required documentation in the previous step</li>
            <li>2. Admin review (2-5 business days)</li>
            <li>3. Receive verification status notification</li>
            <li>4. Badge appears on profile (if enabled)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};