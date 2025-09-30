/**
 * Payment Types
 */

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'paypal';
export type TransactionType = 'payment' | 'refund' | 'payout';

export interface PaymentTransaction {
  id: string;
  client_id: string;
  trainer_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  transaction_type: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TrainerPackage {
  id: string;
  trainer_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration?: number; // in days
  session_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatement {
  id: string;
  trainer_id: string;
  package_id: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  platform_fee: number;
  net_amount: number;
  status: 'draft' | 'finalized' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface CreatePaymentRequest {
  trainer_id: string;
  package_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  description?: string;
}

export interface RefundRequest {
  transaction_id: string;
  amount?: number; // Partial refund if specified
  reason: string;
}

export interface PaymentMethodData {
  id: string;
  user_id: string;
  type: PaymentMethod;
  last_four?: string;
  brand?: string;
  is_default: boolean;
  created_at: string;
}
