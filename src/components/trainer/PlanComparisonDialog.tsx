import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  plan_id: string;
  plan_name: string;
  display_name: string;
  monthly_price_cents: number;
  has_commission: boolean;
  commission_details: any;
  is_current_plan: boolean;
  can_switch_to: boolean;
  switch_type: string;
  blocked_reason: string | null;
  proration_estimate_cents: number;
}

interface PlanComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerId: string;
  onSuccess: () => void;
  renewalDate?: string;
  isCancelled?: boolean;
}

export const PlanComparisonDialog = ({ open, onOpenChange, trainerId, onSuccess, renewalDate, isCancelled }: PlanComparisonDialogProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customCancellationReason, setCustomCancellationReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_trainer_available_plans' as any, {
        p_trainer_id: trainerId
      });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async () => {
    if (!selectedPlan) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('change_trainer_plan' as any, {
        p_requested_plan_id: selectedPlan.plan_id,
        p_reason: reason || null
      });

      if (error) throw error;

      const result = data as any;
      
      // Check if payment is required (upgrade)
      if (result?.requires_payment) {
        // Create Stripe checkout session for plan upgrade
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
          'create-checkout-session',
          {
            body: {
              payment_type: 'plan_upgrade',
              history_id: result.history_id,
              proration_amount_cents: result.proration_cents,
              new_plan_name: result.new_plan_name,
              success_url: `${window.location.origin}/trainer/plan-upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${window.location.origin}/trainer/settings?upgrade_cancelled=true`,
            },
          }
        );

        if (sessionError) throw sessionError;

        // Redirect to Stripe Checkout
        if (sessionData?.url) {
          window.location.href = sessionData.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } else {
        // Downgrade or switch - no payment required
        toast({
          title: result.change_type === 'upgrade' ? 'Plan Upgraded!' : 'Plan Change Scheduled',
          description: result.change_type === 'upgrade'
            ? `You've been upgraded to ${selectedPlan.display_name}. Prorated charge: £${(result.proration_cents / 100).toFixed(2)}`
            : `Your plan will change to ${selectedPlan.display_name} on ${result.effective_date}`
        });

        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      setSubmitting(false);
    }
  };

  const handleCancellation = async () => {
    setSubmitting(true);
    try {
      const finalReason = cancellationReason === 'other' ? customCancellationReason : cancellationReason;
      
      const { data, error } = await supabase.rpc('cancel_trainer_plan' as any, {
        p_reason: finalReason
      });

      if (error) throw error;

      toast({
        title: 'Plan Cancellation Scheduled',
        description: `Your plan will remain active until ${formatDate(renewalDate)}. You can reactivate anytime before then.`
      });

      onSuccess();
      onOpenChange(false);
      setShowCancelSection(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(cents / 100);
  };

  const formatCommission = (plan: Plan) => {
    if (!plan.has_commission) return 'No commission';
    
    if (plan.commission_details.fee_type === 'percentage') {
      return `${plan.commission_details.fee_value_percent}% commission`;
    } else {
      return `${formatPrice(plan.commission_details.fee_value_flat_cents)} per package`;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'your renewal date';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const currentPlan = plans.find(p => p.is_current_plan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{showCancelSection ? 'Cancel Your Plan' : 'Manage Your Plan'}</DialogTitle>
          {!showCancelSection && (
            <DialogDescription>
              Change to a different plan or cancel your current membership.
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading plans...</div>
        ) : showCancelSection ? (
          <div className="space-y-6 p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Cancel Your Plan</h3>
              <p className="text-sm text-muted-foreground">
                Your plan will remain active until {formatDate(renewalDate)}. You can reactivate anytime before then.
              </p>

              <div className="space-y-3">
                <Label className="text-base">Why are you cancelling?</Label>
                {['Too expensive', 'Not enough clients', 'Features not meeting needs', 'Switching platforms', 'Taking a break', 'other'].map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cancellation_reason"
                      value={option}
                      checked={cancellationReason === option}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{option === 'other' ? 'Other' : option}</span>
                  </label>
                ))}
              </div>

              {cancellationReason === 'other' && (
                <Textarea
                  value={customCancellationReason}
                  onChange={(e) => setCustomCancellationReason(e.target.value)}
                  placeholder="Please tell us more..."
                  rows={3}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelSection(false)}
                  className="w-full sm:w-auto"
                >
                  Back to Plans
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancellation}
                  disabled={!cancellationReason || (cancellationReason === 'other' && !customCancellationReason) || submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting ? 'Processing...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div
                  key={plan.plan_id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan?.plan_id === plan.plan_id
                      ? 'border-primary ring-2 ring-primary'
                      : plan.can_switch_to
                      ? 'hover:border-primary/50'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => plan.can_switch_to && setSelectedPlan(plan)}
                >
                  {plan.is_current_plan && (
                    <Badge className="absolute top-2 right-2" variant="default">
                      Current Plan
                    </Badge>
                  )}

                  <div className="space-y-3 mt-2">
                    <h3 className="font-semibold text-lg">{plan.display_name}</h3>
                    
                    <div className="text-2xl font-bold">{formatPrice(plan.monthly_price_cents)}</div>
                    <div className="text-sm text-muted-foreground">per month</div>

                    <div className="text-sm">
                      {formatCommission(plan)}
                    </div>

                    {plan.switch_type === 'upgrade' && plan.proration_estimate_cents > 0 && (
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        Prorated today: {formatPrice(plan.proration_estimate_cents)}
                      </div>
                    )}

                    {plan.blocked_reason && (
                      <div className="flex items-start gap-2 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3 mt-0.5" />
                        <span>{plan.blocked_reason}</span>
                      </div>
                    )}

                    {!plan.is_current_plan && plan.can_switch_to && (
                      <Badge variant={plan.switch_type === 'upgrade' ? 'default' : 'secondary'}>
                        {plan.switch_type === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isCancelled && (
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowCancelSection(true)}
                >
                  Cancel Current Plan
                </Button>
              </div>
            )}

            {selectedPlan && !selectedPlan.is_current_plan && (
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{currentPlan?.display_name}</div>
                    <div className="text-sm text-muted-foreground">{formatPrice(currentPlan?.monthly_price_cents || 0)}/mo</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedPlan.display_name}</div>
                    <div className="text-sm text-muted-foreground">{formatPrice(selectedPlan.monthly_price_cents)}/mo</div>
                  </div>
                </div>

                {selectedPlan.switch_type === 'upgrade' && (
                  <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Immediate upgrade</div>
                      <div className="text-muted-foreground">
                        You'll be charged {formatPrice(selectedPlan.proration_estimate_cents)} today for the remaining days in your billing cycle.
                        Your next full payment will be on your current renewal date.
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlan.switch_type === 'downgrade' && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Scheduled downgrade</div>
                      <div className="text-muted-foreground">
                        Your plan will change at your next renewal date. You'll keep your current features until then.
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Reason for change {selectedPlan.switch_type === 'downgrade' && <span className="text-destructive">*</span>}
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you're changing plans..."
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handlePlanChange}
                    disabled={submitting || (selectedPlan.switch_type === 'downgrade' && !reason)}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? 'Processing...' : selectedPlan.switch_type === 'upgrade' ? 'Proceed to Payment' : 'Schedule Downgrade'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
