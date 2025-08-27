import { Money, PayoutFrequency, MembershipSettings } from '@/hooks/usePaymentStatements';

export const DEFAULT_TIMEZONE = 'Europe/London';

// Money utilities
export function createMoney(currency: string, amount: number): Money {
  return { currency, amount };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} and ${b.currency}`);
  }
  return { currency: a.currency, amount: a.amount + b.amount };
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract different currencies: ${a.currency} and ${b.currency}`);
  }
  return { currency: a.currency, amount: a.amount - b.amount };
}

export function multiplyMoney(money: Money, multiplier: number): Money {
  return { currency: money.currency, amount: money.amount * multiplier };
}

export function formatMoney(money: Money): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: money.currency,
  });
  return formatter.format(money.amount);
}

// Split money evenly across n periods, distributing remainder to earliest periods
export function splitMoneyEvenly(total: Money, n: number): Money[] {
  if (n <= 0) throw new Error('Number of periods must be positive');
  
  const baseAmount = Math.floor(total.amount / n);
  const remainder = total.amount % n;
  
  return Array.from({ length: n }, (_, index) => ({
    currency: total.currency,
    amount: baseAmount + (index < remainder ? 1 : 0)
  }));
}

// Compute onboarding fee based on membership settings
export function computeOnboardingFee(
  finalPrice: Money, 
  membership: MembershipSettings
): Money {
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
}

// Allocate fee across periods (even or frontload)
export function allocateFeeAcrossPeriods(
  fee: Money, 
  periodCount: number, 
  mode: 'even' | 'frontload' = 'even'
): Money[] {
  if (mode === 'frontload') {
    return Array.from({ length: periodCount }, (_, index) => 
      index === 0 ? fee : createMoney(fee.currency, 0)
    );
  } else {
    return splitMoneyEvenly(fee, periodCount);
  }
}

// Compute period boundaries for weekly/monthly cadence
export function computePeriodBoundaries(
  startDateISO: string,
  count: number,
  frequency: PayoutFrequency,
  timezone: string = DEFAULT_TIMEZONE
): Array<{ start: string; end: string }> {
  const startDate = new Date(startDateISO);
  const periods: Array<{ start: string; end: string }> = [];

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
}

// Format duration label
export function formatDurationLabel(durationWeeks?: number, durationMonths?: number): string {
  if (durationWeeks) {
    return `${durationWeeks} week${durationWeeks !== 1 ? 's' : ''}`;
  } else if (durationMonths) {
    return `${durationMonths} month${durationMonths !== 1 ? 's' : ''}`;
  }
  return 'Unknown duration';
}

// Get period count from duration and frequency
export function getPeriodCount(
  durationWeeks?: number,
  durationMonths?: number,
  payoutFrequency?: PayoutFrequency
): number {
  if (durationWeeks && payoutFrequency === 'weekly') {
    return durationWeeks;
  } else if (durationWeeks && payoutFrequency === 'monthly') {
    return Math.ceil(durationWeeks / 4);
  } else if (durationMonths && payoutFrequency === 'monthly') {
    return durationMonths;
  } else if (durationMonths && payoutFrequency === 'weekly') {
    return durationMonths * 4; // Approximate
  }
  return 1;
}

// Check if approval deadline has passed
export function isApprovalOverdue(approvalDeadlineAt: string): boolean {
  return new Date() > new Date(approvalDeadlineAt);
}

// Format approval status for display
export function formatApprovalStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Pending Approval';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'auto_approved': return 'Auto-Approved';
    default: return status;
  }
}

// Get membership plan description
export function getMembershipPlanBlurb(membership: MembershipSettings): string {
  if (membership.plan_type === 'high_sub_no_onboarding') {
    return 'High subscription plan - no onboarding fees';
  } else if (membership.plan_type === 'low_sub_with_onboarding') {
    const feeDescription = membership.onboarding_fee_kind === 'fixed' 
      ? `£${membership.onboarding_fee_value} fixed fee`
      : `${membership.onboarding_fee_value}% commission`;
    return `Low subscription plan with onboarding fee (${feeDescription})`;
  }
  return 'Standard membership plan';
}