import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Eye, FileText, AlertCircle } from 'lucide-react';
import { useTrainerVerification } from '@/hooks/useTrainerVerification';
import { toast } from 'sonner';

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  under_review: <Eye className="w-4 h-4" />,
  approved: <CheckCircle2 className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  verified: <CheckCircle2 className="w-4 h-4" />
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  verified: 'bg-green-100 text-green-800'
};

export const VerificationManagement = () => {
  const { verificationRequests, trainerProfiles, updateVerificationStatus, loading } = useTrainerVerification();
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

  const handleReviewSubmit = async () => {
    if (!selectedTrainer || !reviewAction) return;

    try {
      await updateVerificationStatus(
        selectedTrainer.trainer_id || selectedTrainer.id,
        reviewAction === 'approve' ? 'verified' : 'rejected',
        adminNotes,
        reviewAction === 'reject' ? rejectionReason : undefined
      );
      
      setIsReviewModalOpen(false);
      setSelectedTrainer(null);
      setAdminNotes('');
      setRejectionReason('');
      setReviewAction(null);
    } catch (error) {
      console.error('Failed to update verification status:', error);
    }
  };

  const openReviewModal = (trainer: any, action: 'approve' | 'reject') => {
    setSelectedTrainer(trainer);
    setReviewAction(action);
    setAdminNotes(trainer.admin_notes || '');
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading verification data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verification Management</h2>
          <p className="text-muted-foreground">
            Review and approve trainer verification requests
          </p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="profiles">All Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Verification Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No verification requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verificationRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {request.profiles?.first_name} {request.profiles?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.profiles?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[request.status]}>
                            {statusIcons[request.status]}
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {request.documents_provided.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Documents:</p>
                          <div className="text-sm text-muted-foreground">
                            {request.documents_provided.length} document(s) provided
                          </div>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openReviewModal(request, 'approve')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => openReviewModal(request, 'reject')}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {request.admin_notes && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-medium">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Trainer Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainerProfiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        {profile.verification_requested_at && (
                          <p className="text-xs text-muted-foreground">
                            Last request: {new Date(profile.verification_requested_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[profile.verification_status]}>
                          {statusIcons[profile.verification_status]}
                          {profile.verification_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => openReviewModal(profile, 'approve')}
                        size="sm"
                        variant={profile.verification_status === 'verified' ? 'outline' : 'default'}
                        className={profile.verification_status !== 'verified' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {profile.verification_status === 'verified' ? 'Re-verify' : 'Verify'}
                      </Button>
                      <Button
                        onClick={() => openReviewModal(profile, 'reject')}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>

                    {profile.admin_review_notes && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium">Review Notes:</p>
                        <p className="text-sm text-muted-foreground">{profile.admin_review_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Verification
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Trainer: {selectedTrainer?.first_name} {selectedTrainer?.last_name}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
                rows={3}
              />
            </div>

            {reviewAction === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the verification is being rejected..."
                  rows={3}
                  required
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={reviewAction === 'reject' ? 'destructive' : 'default'}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};