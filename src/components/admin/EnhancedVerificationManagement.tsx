import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Clock, AlertCircle, Eye, FileText, Shield, Award, User } from 'lucide-react';
import { useEnhancedTrainerVerification } from '@/hooks/useEnhancedTrainerVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainerProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  verification_status?: string;
  user_type: string;
}

const CheckTypeLabels = {
  cimspa_membership: 'CIMSPA Membership',
  insurance_proof: 'Professional Insurance', 
  first_aid_certification: 'First Aid Certification',
  qualifications: 'Qualifications',
  identity_match: 'Identity Verification',
};

const StatusConfig = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending Review' },
  verified: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Verified' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
  expired: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Expired' },
};

export const EnhancedVerificationManagement = () => {
  const {
    loading,
    checks,
    auditLog,
    isAdmin,
    fetchVerificationData,
    adminUpdateCheck,
  } = useEnhancedTrainerVerification();

  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    checkType: '' as any,
    status: '' as any,
    adminNotes: '',
    rejectionReason: '',
  });

  // Fetch all trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      if (!isAdmin) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, verification_status, user_type')
        .eq('user_type', 'trainer')
        .order('first_name');

      setTrainers(data || []);
    };

    fetchTrainers();
  }, [isAdmin]);

  // Fetch verification data when trainer is selected
  useEffect(() => {
    if (selectedTrainer) {
      fetchVerificationData(selectedTrainer);
    }
  }, [selectedTrainer, fetchVerificationData]);

  const handleReviewCheck = (checkType: string, currentStatus: string) => {
    setReviewData({
      checkType,
      status: currentStatus === 'pending' ? 'verified' : currentStatus,
      adminNotes: '',
      rejectionReason: '',
    });
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedTrainer || !reviewData.checkType) return;

    try {
      await adminUpdateCheck(
        selectedTrainer,
        reviewData.checkType,
        reviewData.status,
        reviewData.adminNotes,
        reviewData.rejectionReason
      );

      setReviewModalOpen(false);
      setReviewData({
        checkType: '',
        status: '',
        adminNotes: '',
        rejectionReason: '',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getPendingChecksCount = () => {
    return checks.filter(check => check.status === 'pending').length;
  };

  const getTrainerName = (trainer: TrainerProfile) => {
    return `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Unknown';
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Reviews ({getPendingChecksCount()})
              </TabsTrigger>
              <TabsTrigger value="all-trainers">All Trainers</TabsTrigger>
              <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <p>Loading pending reviews...</p>
              ) : checks.filter(check => check.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {checks
                    .filter(check => check.status === 'pending')
                    .map(check => {
                      const trainer = trainers.find(t => t.id === check.trainer_id);
                      return (
                        <Card key={check.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium">
                                  {CheckTypeLabels[check.check_type as keyof typeof CheckTypeLabels]}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Trainer: {trainer ? getTrainerName(trainer) : 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {new Date(check.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTrainer(check.trainer_id);
                                    handleReviewCheck(check.check_type, check.status);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No pending reviews
                </p>
              )}
            </TabsContent>

            <TabsContent value="all-trainers" className="space-y-4">
              <div className="grid gap-4">
                {trainers.map(trainer => (
                  <Card key={trainer.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent 
                      className="p-4"
                      onClick={() => setSelectedTrainer(trainer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{getTrainerName(trainer)}</h4>
                            <p className="text-sm text-muted-foreground">
                              Status: {trainer.verification_status || 'Not Verified'}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit-log" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {auditLog.map(entry => (
                    <div key={entry.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {entry.action} - {CheckTypeLabels[entry.check_id as keyof typeof CheckTypeLabels] || 'General'}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Actor: {entry.actor} | Reason: {entry.reason || 'No reason provided'}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Trainer Details Modal/Panel */}
      {selectedTrainer && (
        <Card>
          <CardHeader>
            <CardTitle>
              Verification Details - {trainers.find(t => t.id === selectedTrainer)?.first_name || 'Unknown'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks
                .filter(check => check.trainer_id === selectedTrainer)
                .map(check => {
                  const statusConfig = StatusConfig[check.status];
                  return (
                    <Card key={check.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">
                            {CheckTypeLabels[check.check_type as keyof typeof CheckTypeLabels]}
                          </h4>
                          <Badge className={statusConfig.color}>
                            <statusConfig.icon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          {check.provider && <p><strong>Provider:</strong> {check.provider}</p>}
                          {check.member_id && <p><strong>Member ID:</strong> {check.member_id}</p>}
                          {check.certificate_id && <p><strong>Certificate ID:</strong> {check.certificate_id}</p>}
                          {check.policy_number && <p><strong>Policy Number:</strong> {check.policy_number}</p>}
                          {check.coverage_amount && <p><strong>Coverage:</strong> £{check.coverage_amount.toLocaleString()}</p>}
                          {check.expiry_date && (
                            <p><strong>Expiry:</strong> {new Date(check.expiry_date).toLocaleDateString()}</p>
                          )}
                          {check.evidence_file_url && (
                            <p><strong>Document:</strong> <span className="text-blue-600">Uploaded</span></p>
                          )}
                        </div>

                        {check.admin_notes && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-medium text-blue-800">Admin Notes:</p>
                            <p className="text-sm text-blue-700">{check.admin_notes}</p>
                          </div>
                        )}

                        {check.rejection_reason && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{check.rejection_reason}</p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm"
                            onClick={() => handleReviewCheck(check.check_type, check.status)}
                          >
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Verification Check</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <select
                className="w-full mt-1 p-2 border border-border rounded"
                value={reviewData.status}
                onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="verified">Approve</option>
                <option value="rejected">Reject</option>
                <option value="pending">Keep Pending</option>
              </select>
            </div>

            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={reviewData.adminNotes}
                onChange={(e) => setReviewData(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder="Internal notes about this verification..."
              />
            </div>

            {reviewData.status === 'rejected' && (
              <div>
                <Label>Rejection Reason</Label>
                <Textarea
                  value={reviewData.rejectionReason}
                  onChange={(e) => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  placeholder="Reason for rejection (visible to trainer)..."
                  required
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmitReview} className="flex-1">
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};