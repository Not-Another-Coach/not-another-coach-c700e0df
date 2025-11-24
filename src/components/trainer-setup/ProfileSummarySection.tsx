import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, FileText, Award, Shield, Upload, X } from 'lucide-react';
import { useProfessionalDocumentsState } from '@/hooks/useProfessionalDocumentsState';
import { useEnhancedTrainerVerification } from '@/hooks/useEnhancedTrainerVerification';
import { useTrainerProfile } from '@/hooks/useTrainerProfile';

const CheckTypeConfig = {
  cimspa_membership: {
    title: 'CIMSPA Membership',
    icon: Award,
    description: 'Professional membership verification',
  },
  insurance_proof: {
    title: 'Professional Insurance',
    icon: Shield,
    description: 'Indemnity insurance coverage',
  },
  first_aid_certification: {
    title: 'First Aid Certification',
    icon: FileText,
    description: 'Current first aid qualification',
  },
};

const StatusConfig = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Under Review' },
  verified: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Verified' },
  rejected: { icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
  expired: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Expired' },
  not_started: { icon: Upload, color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Not Started' },
  not_applicable: { icon: X, color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Not Applicable' },
};

export const ProfileSummarySection = () => {
  const { profile } = useTrainerProfile();
  const { getCompletionStatus, notApplicable } = useProfessionalDocumentsState(profile?.document_not_applicable);
  const { checks, getCheckByType } = useEnhancedTrainerVerification();
  
  const completionStatus = getCompletionStatus();

  const getDocumentStatus = (checkType: string) => {
    // Check if marked as not applicable first
    if (notApplicable[checkType]) return 'not_applicable';
    
    const check = getCheckByType(checkType as any);
    if (!check) return 'not_started';
    return check.status;
  };

  const getOverallStatus = () => {
    const allStatuses = Object.keys(CheckTypeConfig).map(checkType => getDocumentStatus(checkType));
    
    if (allStatuses.every(status => status === 'verified')) {
      return { status: 'completed', message: 'All documents verified - your profile is ready!' };
    } else if (allStatuses.some(status => status === 'rejected')) {
      return { status: 'attention', message: 'Some documents need attention - please review rejected items' };
    } else if (allStatuses.some(status => status === 'pending')) {
      return { status: 'pending', message: 'Documents are under review - we\'ll notify you once complete' };
    } else {
      return { status: 'incomplete', message: 'Please complete your professional document verification' };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Profile Verification Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            overallStatus.status === 'completed' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : overallStatus.status === 'attention'
              ? 'bg-red-50 border-red-200 text-red-800'
              : overallStatus.status === 'pending'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="font-medium">{overallStatus.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Documents Status */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(CheckTypeConfig).map(([checkType, config]) => {
            const status = getDocumentStatus(checkType);
            const statusConfig = StatusConfig[status as keyof typeof StatusConfig];
            const IconComponent = config.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div key={checkType} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{config.title}</h4>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <Badge className={statusConfig.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Qualification Certificates for Verification */}
      {profile?.uploaded_certificates && Array.isArray(profile.uploaded_certificates) && profile.uploaded_certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Qualification Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The following qualification certificates have been uploaded and are awaiting admin verification:
            </p>
            {profile.uploaded_certificates.map((cert: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{cert.qualification || cert.name || `Certificate ${index + 1}`}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cert.originalName || cert.file_name || cert.type || 'Uploaded certificate'}
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overallStatus.status === 'completed' ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                🎉 <strong>Congratulations!</strong> Your profile verification is complete.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Your "Verified Coach" badge is now active</li>
                <li>• Your profile has increased visibility in search results</li>
                <li>• You have access to all premium features</li>
                <li>• Clients can see your verified status, building trust</li>
              </ul>
            </div>
          ) : overallStatus.status === 'attention' ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please review and resubmit any rejected documents:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Check the "Professional Documents" tab for specific feedback</li>
                <li>• Update your information based on admin notes</li>
                <li>• Resubmit corrected documents for review</li>
              </ul>
            </div>
          ) : overallStatus.status === 'pending' ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your documents are being reviewed by our admin team:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Review typically takes 2-5 business days</li>
                <li>• You'll receive an email notification when complete</li>
                <li>• No further action needed from you at this time</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Complete your professional document verification:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Go back to the "Professional Documents" tab</li>
                <li>• Upload required certificates and documentation</li>
                <li>• Submit all documents for admin review</li>
                <li>• Once verified, your profile will display the "Verified Coach" badge</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Benefits Reminder */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-2">Why Verification Matters</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Trust:</strong> Clients feel more confident booking verified trainers</li>
            <li>• <strong>Credibility:</strong> Professional qualifications are independently validated</li>
            <li>• <strong>Visibility:</strong> Verified profiles appear higher in search results</li>
            <li>• <strong>Premium Access:</strong> Unlock advanced features and capabilities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};