import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MembershipAssignmentService, TrainerMembershipInfo } from '@/services/admin/membershipAssignment';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { ExtendGracePeriodDialog } from './ExtendGracePeriodDialog';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Zap, UserPlus, Clock, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function TrainerMembershipAssignment() {
  const [trainers, setTrainers] = useState<TrainerMembershipInfo[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<TrainerMembershipInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerMembershipInfo | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [extendGraceDialog, setExtendGraceDialog] = useState<{ open: boolean; trainer: TrainerMembershipInfo | null }>({ open: false, trainer: null });
  const [retryingPayment, setRetryingPayment] = useState<string | null>(null);

  const { toast } = useToast();
  const { plans } = useMembershipPlans();

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    filterTrainerList();
  }, [trainers, searchTerm, filterStatus]);

  const loadTrainers = async () => {
    setLoading(true);
    console.log('Loading trainers...');
    const response = await MembershipAssignmentService.getTrainersWithMemberships();
    
    if (response.success && response.data) {
      console.log('Trainers loaded successfully:', response.data.length);
      setTrainers(response.data);
    } else {
      console.error('Failed to load trainers:', response.error);
      toast({
        title: 'Error',
        description: typeof response.error === 'string' ? response.error : 'Failed to load trainers',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const filterTrainerList = () => {
    let filtered = [...trainers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.trainer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.trainer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'assigned') {
      filtered = filtered.filter((t) => t.is_active);
    } else if (filterStatus === 'unassigned') {
      filtered = filtered.filter((t) => !t.is_active);
    }

    setFilteredTrainers(filtered);
  };

  const handleAssignClick = (trainer: TrainerMembershipInfo) => {
    setSelectedTrainer(trainer);
    setSelectedPlanId(trainer.current_plan_id || '');
    setAssignmentNotes('');
    setAssignDialogOpen(true);
  };

  const handleAssignPlan = async () => {
    if (!selectedTrainer || !selectedPlanId) return;

    console.log('Assigning plan:', { trainerId: selectedTrainer.trainer_id, planId: selectedPlanId });

    const response = await MembershipAssignmentService.assignPlan(
      selectedTrainer.trainer_id,
      selectedPlanId,
      assignmentNotes
    );

    if (response.success) {
      toast({
        title: 'Success',
        description: 'Membership plan assigned successfully',
      });
      setAssignDialogOpen(false);
      console.log('Plan assigned, reloading trainers...');
      await loadTrainers();
    } else {
      console.error('Assignment failed:', response.error);
      toast({
        title: 'Error',
        description: typeof response.error === 'string' ? response.error : 'Failed to assign plan',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAssign = async () => {
    setBulkAssigning(true);
    const response = await MembershipAssignmentService.bulkAssignDefault();

    if (response.success && response.data) {
      const count = response.data.length;
      toast({
        title: 'Bulk Assignment Complete',
        description: `Successfully assigned default plan to ${count} trainer${count !== 1 ? 's' : ''}`,
      });
      loadTrainers();
    } else {
      toast({
        title: 'Error',
        description: typeof response.error === 'string' ? response.error : 'Failed to bulk assign plans',
        variant: 'destructive',
      });
    }
    setBulkAssigning(false);
  };

  const handleRetryPayment = async (trainerId: string) => {
    setRetryingPayment(trainerId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-retry-payment', {
        body: { trainer_id: trainerId }
      });

      if (error) throw error;

      toast({
        title: 'Payment Retry Initiated',
        description: 'Payment retry has been processed.',
      });
      
      await loadTrainers();
    } catch (error: any) {
      toast({
        title: 'Retry Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRetryingPayment(null);
    }
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return 'N/A';
    return `£${(cents / 100).toFixed(2)}`;
  };

  const unassignedCount = trainers.filter((t) => !t.is_active).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading trainers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Trainer Membership Assignments
              </CardTitle>
              <CardDescription>
                Assign membership plans to trainers
              </CardDescription>
            </div>
            {unassignedCount > 0 && (
              <Button
                onClick={handleBulkAssign}
                disabled={bulkAssigning}
                variant="outline"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Bulk Assign to {unassignedCount} Unassigned
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trainers Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Trainer</th>
                    <th className="text-left p-3 font-medium">Current Plan</th>
                    <th className="text-left p-3 font-medium">Monthly Price</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Payment</th>
                    <th className="text-left p-3 font-medium">Renewal Date</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainers.map((trainer) => (
                    <tr key={trainer.trainer_id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{trainer.trainer_name}</div>
                          <div className="text-sm text-muted-foreground">{trainer.trainer_email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        {trainer.current_plan_name ? (
                          <div>
                            <div className="font-medium">{trainer.current_plan_name}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {trainer.current_plan_type}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not Assigned</span>
                        )}
                      </td>
                      <td className="p-3">{formatPrice(trainer.monthly_price_cents)}</td>
                      <td className="p-3">
                        {trainer.is_active ? (
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {trainer.payment_status === 'past_due' && (
                          <Badge variant="destructive">Past Due</Badge>
                        )}
                        {trainer.payment_status === 'limited_mode' && (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">Limited</Badge>
                        )}
                        {trainer.payment_status === 'current' && (
                          <Badge variant="outline" className="border-green-500 text-green-600">Current</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {trainer.renewal_date
                          ? new Date(trainer.renewal_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          {trainer.payment_status === 'past_due' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetryPayment(trainer.trainer_id)}
                                disabled={retryingPayment === trainer.trainer_id}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {retryingPayment === trainer.trainer_id ? 'Retrying...' : 'Retry Payment'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setExtendGraceDialog({ open: true, trainer })}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Extend Grace
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignClick(trainer)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {trainer.is_active ? 'Change' : 'Assign'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTrainers.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No trainers found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Membership Plan</DialogTitle>
            <DialogDescription>
              Assign a membership plan to {selectedTrainer?.trainer_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.plan_name} - £{(plan.monthly_price_cents / 100).toFixed(2)}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this assignment..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignPlan} disabled={!selectedPlanId}>
              Assign Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grace Period Extension Dialog */}
      {extendGraceDialog.trainer && (
        <ExtendGracePeriodDialog 
          open={extendGraceDialog.open}
          onOpenChange={(open) => setExtendGraceDialog({ open, trainer: null })}
          trainerId={extendGraceDialog.trainer.trainer_id}
          currentGraceEnd={extendGraceDialog.trainer.grace_end_date || ''}
          onSuccess={loadTrainers}
        />
      )}
    </>
  );
}
