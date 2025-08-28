import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type Money = {
  currency: string;
  amount: number;
};

export type Role = 'customer' | 'trainer' | 'admin';

export type PayoutFrequency = 'weekly' | 'monthly';

export type CustomerPaymentMode = 'upfront' | 'installments';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export type MembershipPlanType = 'low_sub_with_onboarding' | 'high_sub_no_onboarding';

export interface PaymentPackage {
  id: string;
  trainer_id: string;
  customer_id: string;
  coach_selection_request_id?: string;
  title: string;
  start_date: string;
  duration_weeks?: number;
  duration_months?: number;
  list_price_currency: string;
  list_price_amount: number;
  final_price_currency: string;
  final_price_amount: number;
  payout_frequency: PayoutFrequency;
  customer_payment_mode: CustomerPaymentMode;
  installment_config?: any;
  applied_onboarding_fee_kind?: string;
  applied_onboarding_fee_value?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipSettings {
  id: string;
  trainer_id: string;
  plan_type: MembershipPlanType;
  onboarding_fee_kind?: 'fixed' | 'percent';
  onboarding_fee_value?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayment {
  id: string;
  package_id: string;
  stripe_payment_intent_id?: string;
  paid_at: string;
  amount_currency: string;
  amount_value: number;
  payment_method: string;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PayoutPeriod {
  id: string;
  package_id: string;
  period_index: number;
  period_start: string;
  period_end: string;
  gross_portion_currency: string;
  gross_portion_amount: number;
  commission_deduction_currency: string;
  commission_deduction_amount: number;
  net_payable_currency: string;
  net_payable_amount: number;
  approval_status: ApprovalStatus;
  approval_opened_at: string;
  approval_deadline_at: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  rejection_attachments?: any[];
  created_at: string;
  updated_at: string;
}

export interface StatementSummary {
  packageId: string;
  role: Role;
  packageTitle: string;
  packageStartDate: string;
  payoutFrequency: PayoutFrequency;
  durationLabel: string;
  totals: {
    packageGross: Money;
    commissionOnboardingTotal?: Money;
    trainerNetTotal: Money;
    customerPaidToDate: Money;
    customerOutstanding: Money;
    trainerPaidOutToDate: Money;
    trainerOutstanding: Money;
  };
  membershipPlanBlurb?: string;
  customerPayments: CustomerPayment[];
  payoutSchedule: PayoutPeriod[];
}

export function usePaymentStatements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PaymentPackage[]>([]);

  const fetchPackages = async () => {
    if (!user) {
      console.log('🔥 usePaymentStatements: No user, skipping fetch');
      return;
    }

    console.log('🔥 usePaymentStatements: Fetching packages for user:', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_packages')
        .select('*')
        .or(`trainer_id.eq.${user.id},customer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      console.log('🔥 usePaymentStatements: Query result:', { data, error });
      if (error) throw error;
      
      const packages = data || [];
      console.log('🔥 usePaymentStatements: Setting packages:', packages.length, 'items');
      setPackages(packages);
    } catch (error) {
      console.error('🔥 usePaymentStatements: Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentStatement = async (
    packageId: string,
    viewerRole: Role,
    options?: { timezone?: string }
  ): Promise<StatementSummary | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-payment-statement', {
        body: {
          packageId,
          viewerRole,
          timezone: options?.timezone || 'Europe/London'
        }
      });

      if (error) throw error;
      return data as StatementSummary;
    } catch (error) {
      console.error('Error generating payment statement:', error);
      toast({
        title: "Error",
        description: "Failed to generate payment statement",
        variant: "destructive",
      });
      return null;
    }
  };

  const approvePayoutPeriod = async (
    packageId: string,
    periodIndex: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('approve-payout-period', {
        body: { packageId, periodIndex }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payout period approved successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error approving payout period:', error);
      toast({
        title: "Error",
        description: "Failed to approve payout period",
        variant: "destructive",
      });
      return false;
    }
  };

  const rejectPayoutPeriod = async (
    packageId: string,
    periodIndex: number,
    reason: string,
    attachments?: Array<{ url: string; kind?: string }>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('reject-payout-period', {
        body: { packageId, periodIndex, reason, attachments }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payout period rejected successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error rejecting payout period:', error);
      toast({
        title: "Error",
        description: "Failed to reject payout period",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchMembershipSettings = async (trainerId?: string) => {
    const targetId = trainerId || user?.id;
    if (!targetId) return null;

    try {
      const { data, error } = await supabase
        .from('trainer_membership_settings')
        .select('*')
        .eq('trainer_id', targetId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as MembershipSettings | null;
    } catch (error) {
      console.error('Error fetching membership settings:', error);
      return null;
    }
  };

  const updateMembershipSettings = async (settings: Partial<MembershipSettings>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('trainer_membership_settings')
        .upsert({
          trainer_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Membership settings updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating membership settings:', error);
      toast({
        title: "Error",
        description: "Failed to update membership settings",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    console.log('🔥 usePaymentStatements: User changed, fetching packages for:', user?.id);
    fetchPackages();
  }, [user]);

  return {
    packages,
    loading,
    fetchPackages,
    generatePaymentStatement,
    approvePayoutPeriod,
    rejectPayoutPeriod,
    fetchMembershipSettings,
    updateMembershipSettings,
  };
}