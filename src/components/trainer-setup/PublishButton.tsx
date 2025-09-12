import { useState } from 'react';
import { useProfilePublication } from '@/hooks/useProfilePublication';
import { useProfileStepValidation } from '@/hooks/useProfileStepValidation';
import { Button } from '@/components/ui/button';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Send, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useProfessionalDocumentsState } from '@/hooks/useProfessionalDocumentsState';

interface PublishButtonProps {
  profile: any;
}

export const PublishButton = ({ profile }: PublishButtonProps) => {
  const { currentRequest, loading, requestPublication, isProfileReadyToPublish } = useProfilePublication();
  const stepValidation = useProfileStepValidation();
  const { getCompletionStatus: getDocsStatus } = useProfessionalDocumentsState();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const readyToPublish = isProfileReadyToPublish(profile, stepValidation); // Now respects local doc status
  const isPublished = profile?.profile_published === true;

  // Get incomplete steps for tooltip
  const getIncompleteSteps = () => {
    if (readyToPublish) return [];
    
    const stepTitles: Record<number, string> = {
      1: "Basic Info",
      2: "Qualifications", 
      3: "Expertise & Services",
      4: "Client Fit Preferences",
      5: "Rates & Packages",
      6: "Discovery Calls",
      7: "Testimonials & Case Studies",
      8: "Ways of Working",
      9: "Image Management",
      10: "Working Hours & New Client Availability",
      11: "T&Cs and Notifications",
      12: "Professional Documents"
    };
    
    const incompleteSteps: string[] = [];
    const requiredSteps = [1, 2, 3, 4, 5, 6, 8, 10, 11, 12];
    requiredSteps.forEach(step => {
      if (step === 12) {
        const docsComplete = getDocsStatus() === 'completed';
        if (!docsComplete) incompleteSteps.push(stepTitles[step - 1]);
        return;
      }
      const completion = stepValidation.getStepCompletion(profile, step);
      if (completion !== 'completed') {
        incompleteSteps.push(stepTitles[step - 1]);
      }
    });
    
    return incompleteSteps;
  };

  const handlePublicationRequest = async () => {
    const success = await requestPublication();
    if (success) {
      setShowConfirmDialog(false);
    }
  };

  const canRequestPublication = readyToPublish && 
    !isPublished && 
    (!currentRequest?.status || currentRequest?.status === 'rejected');

  // Get button state and text
  const getButtonState = () => {
    if (isPublished) {
      return {
        text: 'Published',
        icon: CheckCircle,
        variant: 'outline' as const,
        disabled: true,
        color: 'text-green-600'
      };
    }

    if (currentRequest?.status === 'pending') {
      return {
        text: 'Under Review',
        icon: Clock,
        variant: 'outline' as const,
        disabled: true,
        color: 'text-yellow-600'
      };
    }

    if (currentRequest?.status === 'approved') {
      return {
        text: 'Awaiting Verification',
        icon: Shield,
        variant: 'outline' as const,
        disabled: true,
        color: 'text-blue-600'
      };
    }

    if (currentRequest?.status === 'rejected') {
      return {
        text: 'Resubmit',
        icon: Send,
        variant: 'default' as const,
        disabled: !readyToPublish,
        color: ''
      };
    }

    return {
      text: 'Publish',
      icon: Send,
      variant: 'default' as const,
      disabled: !readyToPublish,
      color: ''
    };
  };

  const buttonState = getButtonState();
  const ButtonIcon = buttonState.icon;
  const incompleteSteps = getIncompleteSteps();

  const tooltipContent = () => {
    if (isPublished) return "Your profile is live and visible to clients";
    if (currentRequest?.status === 'pending') return `Submitted ${formatDistanceToNow(new Date(currentRequest.requested_at), { addSuffix: true })}`;
    if (currentRequest?.status === 'approved') return "Complete verification to publish your profile";
    if (currentRequest?.status === 'rejected') return currentRequest.rejection_reason || "Fix the issues and resubmit";
    if (!readyToPublish && incompleteSteps.length > 0) {
      return `Complete these sections: ${incompleteSteps.join(', ')}`;
    }
    return "Submit your profile for admin review";
  };

  const PublishButtonComponent = (
    <Button 
      variant={buttonState.variant}
      size="sm" 
      disabled={buttonState.disabled || loading}
      className={`flex-1 sm:flex-none ${buttonState.color}`}
       onClick={canRequestPublication ? () => setShowConfirmDialog(true) : undefined}
    >
      <ButtonIcon className="h-4 w-4 mr-2" />
      <span className="hidden xs:inline">{buttonState.text}</span>
      <span className="xs:hidden">{buttonState.text}</span>
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {PublishButtonComponent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltipContent()}</p>
        </TooltipContent>
      </Tooltip>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentRequest?.status === 'rejected' ? 'Resubmit Profile for Publication' : 'Request Profile Publication'}
            </DialogTitle>
            <DialogDescription>
              Your profile will be submitted to our admin team for review. 
              Once approved, it will be published after verification is complete.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentRequest?.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Previous Feedback:</h4>
                <p className="text-sm text-red-800">{currentRequest.rejection_reason}</p>
                {currentRequest.admin_notes && (
                  <p className="text-sm text-red-800 mt-2">{currentRequest.admin_notes}</p>
                )}
              </div>
            )}

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
    </TooltipProvider>
  );
};