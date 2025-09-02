import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shield, 
  Upload, 
  FileText, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { useTrainerVerification } from '@/hooks/useTrainerVerification';
import { useTrainerProfile } from '@/hooks/useTrainerProfile';
import { VerificationNotifications } from './VerificationNotifications';
import { SectionHeader } from './SectionHeader';
import { toast } from 'sonner';

const statusConfig = {
  pending: {
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-amber-100 text-amber-800',
    title: 'Verification Pending',
    description: 'Your verification request is being reviewed by our admin team.'
  },
  under_review: {
    icon: <Eye className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-800',
    title: 'Under Review',
    description: 'An admin is currently reviewing your verification request.'
  },
  verified: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'bg-green-100 text-green-800',
    title: 'Verified',
    description: 'Congratulations! Your profile has been verified and is now published.'
  },
  rejected: {
    icon: <XCircle className="w-5 h-5" />,
    color: 'bg-red-100 text-red-800',
    title: 'Verification Rejected',
    description: 'Your verification request was rejected. Please review the feedback and resubmit.'
  }
};

export const VerificationSection = () => {
  const { profile } = useTrainerProfile();
  const { verificationRequest, submitVerificationRequest, loading } = useTrainerVerification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestVerification = async () => {
    setIsSubmitting(true);
    try {
      await submitVerificationRequest([]);
      toast.success('Verification request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit verification request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading verification status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const verificationStatus = (profile as any)?.verification_status || 'pending';
  const config = statusConfig[verificationStatus as keyof typeof statusConfig];

  // Calculate profile completion percentage
  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    const requiredFields = [
      'first_name',
      'last_name',
      'tagline',
      'bio',
      'location',
      'training_types',
      'specializations',
      'ideal_client_types',
      'coaching_styles',
      'hourly_rate'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = profile[field as keyof typeof profile];
      return value !== null && value !== undefined && 
             (Array.isArray(value) ? value.length > 0 : value !== '');
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const completionPercentage = getProfileCompletionPercentage();
  const canRequestVerification = completionPercentage >= 90 && profile?.terms_agreed;

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Shield, CheckCircle2]}
        title="Profile Verification"
        description="Get your profile verified to start accepting clients and build trust"
      />
      
      <VerificationNotifications />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Profile Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          {config && (
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0">
                <Badge className={config.color}>
                  {config.icon}
                  {config.title}
                </Badge>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
                {verificationRequest?.submitted_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {new Date(verificationRequest.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {(verificationRequest?.admin_notes || (profile as any)?.admin_review_notes) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin Notes:</strong> {verificationRequest?.admin_notes || (profile as any)?.admin_review_notes}
              </AlertDescription>
            </Alert>
          )}

          {/* Rejection Reason */}
          {verificationRequest?.rejection_reason && verificationStatus === 'rejected' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rejection Reason:</strong> {verificationRequest.rejection_reason}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Completion Check */}
          {verificationStatus !== 'verified' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              
              {completionPercentage < 90 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Complete at least 90% of your profile to request verification. 
                    Make sure to fill out all required fields including personal information, 
                    bio, qualifications, and rates.
                  </AlertDescription>
                </Alert>
              )}
              
              {!profile?.terms_agreed && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You must agree to the terms and conditions to request verification.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {verificationStatus === 'pending' || verificationStatus === 'under_review' ? (
              <Button disabled variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Verification Pending
              </Button>
            ) : verificationStatus === 'verified' ? (
              <Button disabled variant="outline">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Profile Verified
              </Button>
            ) : (
              <Button
                onClick={handleRequestVerification}
                disabled={!canRequestVerification || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {verificationStatus === 'rejected' ? 'Resubmit for Verification' : 'Request Verification'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Verification Benefits */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Benefits of Verification</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Your profile becomes visible to clients
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Increased trust and credibility
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Access to client matching features
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Ability to receive booking requests
              </li>
            </ul>
          </div>

          {/* What happens next */}
          {(verificationStatus === 'pending' || verificationStatus === 'under_review') && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Our admin team will review your profile</li>
                <li>We'll verify your qualifications and information</li>
                <li>You'll receive a notification with the outcome</li>
                <li>Once approved, your profile goes live immediately</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};