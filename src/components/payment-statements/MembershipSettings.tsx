import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Info, CheckCircle2, Repeat } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainerMembershipPlans } from '@/hooks/useTrainerMembershipPlans';
import { PaymentStatusBanner } from '@/components/trainer/PaymentStatusBanner';
import { PlanComparisonDialog } from '@/components/trainer/PlanComparisonDialog';
import { CancellationBanner } from '@/components/trainer/CancellationBanner';
import { PlanChangeHistory } from '@/components/trainer/PlanChangeHistory';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const MembershipSettings: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan, loading, refreshPlans } = useTrainerMembershipPlans(user?.id);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    console.log('Current membership plan:', currentPlan);
    if (user?.id) {
      loadPaymentStatus();
    }
  }, [currentPlan, user?.id]);

  const loadPaymentStatus = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('trainer_membership')
      .select('payment_status, grace_end_date, payment_blocked_reason, cancel_at_period_end, cancellation_grace_end, renewal_date, plan_type')
      .eq('trainer_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setPaymentStatus(data);
      setMembership(data);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading membership information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentPlan) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Info className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">No Membership Plan Assigned</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please contact an administrator to have a membership plan assigned to your account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasCommission = currentPlan.has_package_commission;
  const monthlyPrice = (currentPlan.monthly_price_cents / 100).toFixed(2);

  return (
    <div className="space-y-6">
      {paymentStatus && (
        <PaymentStatusBanner 
          paymentStatus={paymentStatus.payment_status}
          graceEndDate={paymentStatus.grace_end_date}
          paymentBlockedReason={paymentStatus.payment_blocked_reason}
        />
      )}
      
      {membership?.cancel_at_period_end && (
        <CancellationBanner 
          renewalDate={membership.renewal_date}
          graceEndDate={membership.cancellation_grace_end}
          onReactivate={() => {
            refreshPlans();
            loadPaymentStatus();
          }}
        />
      )}

      <Tabs defaultValue="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="history">Plan History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Your Membership Plan
            </CardTitle>
            <Button 
              onClick={() => setShowPlanDialog(true)}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Repeat className="h-4 w-4" />
              Manage Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
        {/* Current Plan Display */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 border-2 border-primary bg-primary/5 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-lg font-semibold">{currentPlan.display_name}</Label>
              </div>
              {currentPlan.description && (
                <p className="text-sm text-muted-foreground mb-3">{currentPlan.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Subscription:</span>
                  <span className="font-medium">£{monthlyPrice}</span>
                </div>
                {hasCommission ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Package Commission:</span>
                      <span className="font-medium">
                        {currentPlan.commission_fee_type === 'percentage' 
                          ? `${currentPlan.commission_fee_value_percent}%`
                          : `£${(currentPlan.commission_fee_value_flat_cents / 100).toFixed(2)}`
                        }
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 font-medium">No package commissions - Keep 100% of package payments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Commission Details */}
        {hasCommission && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <Label className="text-base font-medium">Commission Details</Label>
            <p className="text-sm text-muted-foreground">
              {currentPlan.commission_fee_type === 'percentage'
                ? `${currentPlan.commission_fee_value_percent}% commission will be deducted from each package payment you receive.`
                : `£${(currentPlan.commission_fee_value_flat_cents / 100).toFixed(2)} commission will be deducted from each package payment you receive.`
              }
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Important Information:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your membership plan is managed by administrators</li>
                <li>Commission structure applies to all new package payments</li>
                <li>Monthly subscription fees are billed separately</li>
                <li>Contact support if you have questions about your plan</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
        </TabsContent>

        <TabsContent value="history">
          <PlanChangeHistory trainerId={user?.id || ''} />
        </TabsContent>
      </Tabs>

    <PlanComparisonDialog 
      open={showPlanDialog}
      onOpenChange={setShowPlanDialog}
      trainerId={user?.id || ''}
      currentPlanType={membership?.plan_type}
      renewalDate={membership?.renewal_date}
      isCancelled={membership?.cancel_at_period_end}
      onSuccess={() => {
        refreshPlans();
        loadPaymentStatus();
      }}
    />
    </div>
  );
};