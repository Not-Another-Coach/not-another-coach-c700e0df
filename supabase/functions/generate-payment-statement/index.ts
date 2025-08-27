import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-STATEMENT] ${step}${detailsStr}`);
};

// Money utilities
const createMoney = (currency: string, amount: number) => ({ currency, amount });

const formatMoney = (money: { currency: string; amount: number }) => {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: money.currency,
  });
  return formatter.format(money.amount);
};

const splitMoneyEvenly = (total: { currency: string; amount: number }, n: number) => {
  if (n <= 0) throw new Error('Number of periods must be positive');
  
  const baseAmount = Math.floor(total.amount / n);
  const remainder = total.amount % n;
  
  return Array.from({ length: n }, (_, index) => ({
    currency: total.currency,
    amount: baseAmount + (index < remainder ? 1 : 0)
  }));
};

const computeOnboardingFee = (finalPrice: { currency: string; amount: number }, membership: any) => {
  if (membership.plan_type === 'high_sub_no_onboarding') {
    return createMoney(finalPrice.currency, 0);
  }

  if (membership.plan_type === 'low_sub_with_onboarding' && membership.onboarding_fee_kind && membership.onboarding_fee_value) {
    if (membership.onboarding_fee_kind === 'fixed') {
      return createMoney(finalPrice.currency, membership.onboarding_fee_value);
    } else if (membership.onboarding_fee_kind === 'percent') {
      const feeAmount = Math.round(finalPrice.amount * membership.onboarding_fee_value / 100);
      return createMoney(finalPrice.currency, feeAmount);
    }
  }

  return createMoney(finalPrice.currency, 0);
};

const getPeriodCount = (durationWeeks: number | null, durationMonths: number | null, payoutFrequency: string) => {
  if (durationWeeks && payoutFrequency === 'weekly') {
    return durationWeeks;
  } else if (durationWeeks && payoutFrequency === 'monthly') {
    return Math.ceil(durationWeeks / 4);
  } else if (durationMonths && payoutFrequency === 'monthly') {
    return durationMonths;
  } else if (durationMonths && payoutFrequency === 'weekly') {
    return durationMonths * 4;
  }
  return 1;
};

const computePeriodBoundaries = (startDateISO: string, count: number, frequency: string) => {
  const startDate = new Date(startDateISO);
  const periods = [];

  for (let i = 0; i < count; i++) {
    const periodStart = new Date(startDate);
    
    if (frequency === 'weekly') {
      periodStart.setDate(startDate.getDate() + (i * 7));
    } else if (frequency === 'monthly') {
      periodStart.setMonth(startDate.getMonth() + i);
    }

    const periodEnd = new Date(periodStart);
    if (frequency === 'weekly') {
      periodEnd.setDate(periodStart.getDate() + 7);
    } else if (frequency === 'monthly') {
      periodEnd.setMonth(periodStart.getMonth() + 1);
    }

    periods.push({
      start: periodStart.toISOString(),
      end: periodEnd.toISOString()
    });
  }

  return periods;
};

const formatDurationLabel = (durationWeeks: number | null, durationMonths: number | null) => {
  if (durationWeeks) {
    return `${durationWeeks} week${durationWeeks !== 1 ? 's' : ''}`;
  } else if (durationMonths) {
    return `${durationMonths} month${durationMonths !== 1 ? 's' : ''}`;
  }
  return 'Unknown duration';
};

const getMembershipPlanBlurb = (membership: any) => {
  if (membership.plan_type === 'high_sub_no_onboarding') {
    return 'High subscription plan - no onboarding fees';
  } else if (membership.plan_type === 'low_sub_with_onboarding') {
    const feeDescription = membership.onboarding_fee_kind === 'fixed' 
      ? `£${membership.onboarding_fee_value} fixed fee`
      : `${membership.onboarding_fee_value}% commission`;
    return `Low subscription plan with onboarding fee (${feeDescription})`;
  }
  return 'Standard membership plan';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { packageId, viewerRole, timezone = 'Europe/London' } = await req.json();
    logStep("Request parsed", { packageId, viewerRole, timezone });

    // Load package data
    const { data: pkg, error: pkgError } = await supabaseClient
      .from('payment_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError) throw new Error(`Package not found: ${pkgError.message}`);
    logStep("Package loaded", { packageId: pkg.id, trainerId: pkg.trainer_id, customerId: pkg.customer_id });

    // Check permissions
    if (viewerRole === 'trainer' && pkg.trainer_id !== user.id) {
      throw new Error("Unauthorized: Not your package");
    }
    if (viewerRole === 'customer' && pkg.customer_id !== user.id) {
      throw new Error("Unauthorized: Not your package");
    }

    // Load membership settings
    const { data: membership, error: membershipError } = await supabaseClient
      .from('trainer_membership_settings')
      .select('*')
      .eq('trainer_id', pkg.trainer_id)
      .single();

    // Default membership if none exists
    const membershipSettings = membership || {
      plan_type: 'low_sub_with_onboarding',
      onboarding_fee_kind: 'percent',
      onboarding_fee_value: 10
    };

    logStep("Membership settings loaded", membershipSettings);

    // Load customer payments
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('customer_payments')
      .select('*')
      .eq('package_id', packageId)
      .order('paid_at', { ascending: false });

    if (paymentsError) throw new Error(`Error loading payments: ${paymentsError.message}`);
    logStep("Customer payments loaded", { count: payments?.length || 0 });

    // Calculate period count and boundaries
    const periodCount = getPeriodCount(pkg.duration_weeks, pkg.duration_months, pkg.payout_frequency);
    const boundaries = computePeriodBoundaries(pkg.start_date, periodCount, pkg.payout_frequency);
    logStep("Periods calculated", { periodCount, frequency: pkg.payout_frequency });

    // Calculate onboarding fee and allocation
    const finalPrice = createMoney(pkg.final_price_currency, pkg.final_price_amount);
    const onboardingFee = computeOnboardingFee(finalPrice, membershipSettings);
    const grossPortions = splitMoneyEvenly(finalPrice, periodCount);
    const feeAllocations = splitMoneyEvenly(onboardingFee, periodCount);
    
    logStep("Financial calculations done", { 
      finalPrice: formatMoney(finalPrice), 
      onboardingFee: formatMoney(onboardingFee),
      periodCount 
    });

    // Load existing payout periods or create them
    const { data: existingPeriods, error: periodsError } = await supabaseClient
      .from('payout_periods')
      .select('*')
      .eq('package_id', packageId)
      .order('period_index', { ascending: true });

    if (periodsError) throw new Error(`Error loading payout periods: ${periodsError.message}`);

    let payoutPeriods = existingPeriods || [];

    // Create missing payout periods
    if (payoutPeriods.length < periodCount) {
      const missingPeriods = [];
      for (let i = payoutPeriods.length; i < periodCount; i++) {
        const boundary = boundaries[i];
        const grossPortion = grossPortions[i];
        const feeDeduction = feeAllocations[i];
        const netPayable = createMoney(grossPortion.currency, grossPortion.amount - feeDeduction.amount);

        const approvalOpenedAt = new Date(boundary.end);
        const approvalDeadlineAt = new Date(approvalOpenedAt.getTime() + (48 * 60 * 60 * 1000)); // +48 hours

        missingPeriods.push({
          package_id: packageId,
          period_index: i + 1,
          period_start: boundary.start,
          period_end: boundary.end,
          gross_portion_currency: grossPortion.currency,
          gross_portion_amount: grossPortion.amount,
          commission_deduction_currency: feeDeduction.currency,
          commission_deduction_amount: feeDeduction.amount,
          net_payable_currency: netPayable.currency,
          net_payable_amount: netPayable.amount,
          approval_status: 'pending',
          approval_opened_at: approvalOpenedAt.toISOString(),
          approval_deadline_at: approvalDeadlineAt.toISOString()
        });
      }

      if (missingPeriods.length > 0) {
        const { data: createdPeriods, error: createError } = await supabaseClient
          .from('payout_periods')
          .insert(missingPeriods)
          .select('*');

        if (createError) throw new Error(`Error creating payout periods: ${createError.message}`);
        
        // Combine existing and new periods
        payoutPeriods = [...payoutPeriods, ...(createdPeriods || [])];
        logStep("Created missing payout periods", { created: missingPeriods.length });
      }
    }

    // Check for auto-approval on overdue periods
    const now = new Date();
    const overdueUpdates = [];
    
    for (const period of payoutPeriods) {
      if (period.approval_status === 'pending' && new Date(period.approval_deadline_at) <= now) {
        overdueUpdates.push({
          id: period.id,
          approval_status: 'auto_approved',
          approved_at: now.toISOString()
        });
      }
    }

    if (overdueUpdates.length > 0) {
      for (const update of overdueUpdates) {
        await supabaseClient
          .from('payout_periods')
          .update({
            approval_status: update.approval_status,
            approved_at: update.approved_at
          })
          .eq('id', update.id);
      }
      logStep("Auto-approved overdue periods", { count: overdueUpdates.length });
      
      // Reload periods to reflect changes
      const { data: updatedPeriods } = await supabaseClient
        .from('payout_periods')
        .select('*')
        .eq('package_id', packageId)
        .order('period_index', { ascending: true });
      
      payoutPeriods = updatedPeriods || [];
    }

    // Calculate totals
    const customerPaidToDate = (payments || [])
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount_value, 0);

    const customerOutstanding = pkg.customer_payment_mode === 'upfront' 
      ? 0 
      : finalPrice.amount - customerPaidToDate;

    const trainerPaidOutToDate = payoutPeriods
      .filter(p => p.approval_status === 'approved' || p.approval_status === 'auto_approved')
      .reduce((sum, p) => sum + p.net_payable_amount, 0);

    const trainerNetTotal = finalPrice.amount - onboardingFee.amount;
    const trainerOutstanding = trainerNetTotal - trainerPaidOutToDate;

    // Build statement summary
    const statement = {
      packageId: pkg.id,
      role: viewerRole,
      packageTitle: pkg.title,
      packageStartDate: pkg.start_date,
      payoutFrequency: pkg.payout_frequency,
      durationLabel: formatDurationLabel(pkg.duration_weeks, pkg.duration_months),
      totals: {
        packageGross: finalPrice,
        ...(viewerRole === 'trainer' && { commissionOnboardingTotal: onboardingFee }),
        trainerNetTotal: createMoney(finalPrice.currency, trainerNetTotal),
        customerPaidToDate: createMoney(finalPrice.currency, customerPaidToDate),
        customerOutstanding: createMoney(finalPrice.currency, customerOutstanding),
        trainerPaidOutToDate: createMoney(finalPrice.currency, trainerPaidOutToDate),
        trainerOutstanding: createMoney(finalPrice.currency, trainerOutstanding)
      },
      ...(viewerRole === 'trainer' && { membershipPlanBlurb: getMembershipPlanBlurb(membershipSettings) }),
      customerPayments: payments || [],
      payoutSchedule: payoutPeriods
    };

    // Log statement generation in audit table
    await supabaseClient
      .from('payment_statement_views')
      .insert({
        package_id: packageId,
        viewer_id: user.id,
        viewer_role: viewerRole,
        statement_data: statement
      });

    logStep("Statement generated successfully", { 
      totalPeriods: payoutPeriods.length,
      totalGross: formatMoney(finalPrice),
      netTotal: formatMoney(createMoney(finalPrice.currency, trainerNetTotal))
    });

    return new Response(JSON.stringify(statement), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-payment-statement", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});