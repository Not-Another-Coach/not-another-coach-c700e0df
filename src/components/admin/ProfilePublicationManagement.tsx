import { useState } from 'react';
import { useAdminProfilePublication } from '@/hooks/useProfilePublication';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Clock, CheckCircle, XCircle, User, Shield, AlertTriangle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TrainerProfilePreviewModal } from './TrainerProfilePreviewModal';

export const ProfilePublicationManagement = () => {
  const { requests, loading, reviewRequest } = useAdminProfilePublication();
  const [reviewDialog, setReviewDialog] = useState<{ 
    open: boolean; 
    requestId: string; 
    action: 'approved' | 'rejected' | null;
    trainerName: string;
  }>({ 
    open: false, 
    requestId: '', 
    action: null,
    trainerName: ''
  });
  const [profilePreview, setProfilePreview] = useState<{
    open: boolean;
    trainerId: string;
    trainerName: string;
    requestId: string;
  }>({
    open: false,
    trainerId: '',
    trainerName: '',
    requestId: ''
  });
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="gap-1 bg-blue-100 text-blue-800 border-blue-200"><Shield className="w-3 h-3" />Verified</Badge>;
      case 'not_verified':
        return <Badge variant="outline" className="gap-1"><AlertTriangle className="w-3 h-3" />Not Verified</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><User className="w-3 h-3" />Unknown</Badge>;
    }
  };

  const handleViewProfile = (trainerId: string, trainerName: string, requestId: string) => {
    setProfilePreview({
      open: true,
      trainerId,
      trainerName,
      requestId
    });
  };

  const handleProfileReview = async (requestId: string, action: 'approved' | 'rejected', adminNotes: string, rejectionReason?: string) => {
    const success = await reviewRequest(requestId, action, adminNotes, rejectionReason);
    if (success) {
      setProfilePreview({ open: false, trainerId: '', trainerName: '', requestId: '' });
    }
  };

  const handleReview = (requestId: string, action: 'approved' | 'rejected', trainerName: string) => {
    setReviewDialog({ 
      open: true, 
      requestId, 
      action,
      trainerName
    });
    setAdminNotes('');
    setRejectionReason('');
  };

  const submitReview = async () => {
    if (!reviewDialog.action || !reviewDialog.requestId) return;

    const success = await reviewRequest(
      reviewDialog.requestId,
      reviewDialog.action,
      adminNotes,
      reviewDialog.action === 'rejected' ? rejectionReason : undefined
    );

    if (success) {
      setReviewDialog({ open: false, requestId: '', action: null, trainerName: '' });
      setAdminNotes('');
      setRejectionReason('');
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Profile Publication Requests</h1>
          <p className="text-muted-foreground">
            Review and approve trainer profile publication requests
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {pendingRequests.length} Pending
        </Badge>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div 
                key={request.id}
                className="border rounded-lg p-4 space-y-3 bg-yellow-50 border-yellow-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {request.trainer?.first_name} {request.trainer?.last_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Requested {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getVerificationBadge(request.trainer?.verification_status)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewProfile(
                      request.trainer_id,
                      `${request.trainer?.first_name} ${request.trainer?.last_name}`,
                      request.id
                    )}
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReview(
                      request.id, 
                      'approved',
                      `${request.trainer?.first_name} ${request.trainer?.last_name}`
                    )}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReview(
                      request.id, 
                      'rejected',
                      `${request.trainer?.first_name} ${request.trainer?.last_name}`
                    )}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processedRequests.slice(0, 10).map((request) => (
              <div 
                key={request.id}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">
                    {request.trainer?.first_name} {request.trainer?.last_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {request.reviewed_at 
                      ? `Reviewed ${formatDistanceToNow(new Date(request.reviewed_at), { addSuffix: true })}`
                      : `Requested ${formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}`
                    }
                  </p>
                  {request.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">
                      Reason: {request.rejection_reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getVerificationBadge(request.trainer?.verification_status)}
                  {getStatusBadge(request.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No requests */}
      {requests.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Publication Requests</h3>
            <p className="text-muted-foreground">
              There are no profile publication requests at this time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Preview Modal */}
      <TrainerProfilePreviewModal
        open={profilePreview.open}
        onOpenChange={(open) => setProfilePreview(prev => ({ ...prev, open }))}
        trainerId={profilePreview.trainerId}
        trainerName={profilePreview.trainerName}
        requestId={profilePreview.requestId}
        onReview={handleProfileReview}
      />

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approved' ? 'Approve' : 'Reject'} Publication Request
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to {reviewDialog.action === 'approved' ? 'approve' : 'reject'} the publication request for{' '}
              <span className="font-medium">{reviewDialog.trainerName}</span>.
            </p>

            {reviewDialog.action === 'rejected' && (
              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the request is being rejected..."
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Any additional notes for internal use..."
                rows={2}
              />
            </div>

            {reviewDialog.action === 'approved' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If the trainer is already verified, their profile will be published immediately. 
                  If not verified, it will be published automatically once verification is completed.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReviewDialog(prev => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={reviewDialog.action === 'rejected' && !rejectionReason.trim()}
              className={reviewDialog.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={reviewDialog.action === 'rejected' ? 'destructive' : 'default'}
            >
              {reviewDialog.action === 'approved' ? 'Approve Request' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};