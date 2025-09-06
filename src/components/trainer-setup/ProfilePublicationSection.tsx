import { useState } from 'react';
import { useProfilePublication } from '@/hooks/useProfilePublication';
import { useProfileStepValidation } from '@/hooks/useProfileStepValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Send, 
  AlertCircle,
  Shield,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfilePublicationSectionProps {
  profile: any;
  isProfileComplete: boolean;
}

export const ProfilePublicationSection = ({ 
  profile, 
  isProfileComplete 
}: ProfilePublicationSectionProps) => {
  const { currentRequest, loading, requestPublication, isProfileReadyToPublish } = useProfilePublication();
  const stepValidation = useProfileStepValidation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const readyToPublish = isProfileReadyToPublish(profile, stepValidation);
  const isPublished = profile?.profile_published === true;

  // Get publication status
  const getPublicationStatus = () => {
    if (isPublished) {
      return {
        status: 'published',
        title: 'Profile Published',
        description: 'Your profile is live and visible to clients',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }

    if (currentRequest?.status === 'pending') {
      return {
        status: 'pending',
        title: 'Awaiting Admin Review',
        description: 'Your publication request is being reviewed by our admin team',
        icon: Clock,
        title2: `Submitted ${formatDistanceToNow(new Date(currentRequest.requested_at), { addSuffix: true })}`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }

    if (currentRequest?.status === 'approved') {
      return {
        status: 'approved_pending_verification',
        title: 'Approved - Verification Required',
        description: 'Your profile is approved! Complete verification to publish your profile.',
        icon: Shield,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    if (currentRequest?.status === 'rejected') {
      return {
        status: 'rejected',
        title: 'Publication Request Rejected',
        description: currentRequest.rejection_reason || 'Please review the feedback and make necessary changes',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    if (readyToPublish) {
      return {
        status: 'ready',
        title: 'Ready to Publish',
        description: 'Your profile is complete and ready for publication',
        icon: Send,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      };
    }

    return {
      status: 'not_ready',
      title: 'Profile Incomplete',
      description: 'Complete all profile sections to request publication',
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const statusInfo = getPublicationStatus();
  const StatusIcon = statusInfo.icon;

  const handlePublicationRequest = async () => {
    const success = await requestPublication();
    if (success) {
      setShowConfirmDialog(false);
    }
  };

  const canRequestPublication = readyToPublish && 
    !isPublished && 
    !currentRequest?.status || 
    currentRequest?.status === 'rejected';

  return (
    <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          Publication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">{statusInfo.title}</h3>
          <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
          {statusInfo.title2 && (
            <p className="text-xs text-muted-foreground mt-1">{statusInfo.title2}</p>
          )}
        </div>

        {/* Show rejection feedback */}
        {currentRequest?.status === 'rejected' && currentRequest.admin_notes && (
          <div className="bg-white/80 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-1">Admin Feedback:</h4>
            <p className="text-sm text-muted-foreground">{currentRequest.admin_notes}</p>
          </div>
        )}

        {/* Show verification requirement for approved requests */}
        {currentRequest?.status === 'approved' && profile?.verification_status !== 'verified' && (
          <div className="bg-white/80 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Verification Required</p>
                <p className="text-xs text-muted-foreground">
                  Complete your professional verification to publish your profile automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {canRequestPublication && (
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" disabled={loading}>
                  <Send className="w-4 h-4" />
                  Request Publication
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Profile Publication</DialogTitle>
                  <DialogDescription>
                    Your profile will be submitted to our admin team for review. 
                    Once approved, it will be published after verification is complete.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Admin team reviews your profile (usually within 24-48 hours)</li>
                      <li>• If approved, your profile will publish once verification is complete</li>
                      <li>• If rejected, you'll receive feedback to improve your profile</li>
                      <li>• You'll receive notifications about the status via alerts</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Profile Ready</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      All required sections are complete and your profile meets publication requirements.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePublicationRequest} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {isPublished && (
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Live Profile
            </Button>
          )}
        </div>

        {/* Progress indicator for incomplete profiles */}
        {!readyToPublish && !isPublished && (
          <div className="bg-white/80 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Complete these sections to publish:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(step => {
                const completion = stepValidation.getStepCompletion(profile, step);
                if (completion === 'completed') return null;
                
                const stepTitles = [
                  "Basic Info", "Qualifications", "Expertise & Services", 
                  "Client Fit Preferences", "Rates & Packages", "Discovery Calls",
                  "Testimonials & Case Studies", "Ways of Working", "Instagram Integration",
                  "Image Management", "Working Hours & New Client Availability",
                  "T&Cs and Notifications", "Professional Documents"
                ];
                
                return (
                  <div key={step} className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                    <span>{stepTitles[step - 1]} - {completion === 'partial' ? 'Partially Complete' : 'Not Started'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};