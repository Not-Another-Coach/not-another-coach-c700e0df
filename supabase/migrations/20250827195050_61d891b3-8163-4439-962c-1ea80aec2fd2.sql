-- Create core enums for payment statements and payouts system
CREATE TYPE payout_frequency_enum AS ENUM ('weekly', 'monthly');
CREATE TYPE customer_payment_mode_enum AS ENUM ('upfront', 'installments');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'auto_approved');
CREATE TYPE membership_plan_type_enum AS ENUM ('low_sub_with_onboarding', 'high_sub_no_onboarding');

-- Platform settings table for global configuration
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value) VALUES 
  ('onboarding_fee_allocation', '"even"'),
  ('default_timezone', '"Europe/London"'),
  ('approval_window_hours', '48');

-- Trainer membership settings for commission rules
CREATE TABLE public.trainer_membership_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type membership_plan_type_enum NOT NULL DEFAULT 'low_sub_with_onboarding',
  onboarding_fee_kind TEXT CHECK (onboarding_fee_kind IN ('fixed', 'percent')),
  onboarding_fee_value NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Payment packages table for core package information
CREATE TABLE public.payment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_selection_request_id UUID REFERENCES public.coach_selection_requests(id),
  title TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  duration_weeks INTEGER,
  duration_months INTEGER,
  list_price_currency TEXT NOT NULL DEFAULT 'GBP',
  list_price_amount NUMERIC(10,2) NOT NULL,
  final_price_currency TEXT NOT NULL DEFAULT 'GBP',
  final_price_amount NUMERIC(10,2) NOT NULL,
  payout_frequency payout_frequency_enum NOT NULL DEFAULT 'weekly',
  customer_payment_mode customer_payment_mode_enum NOT NULL DEFAULT 'upfront',
  installment_config JSONB,
  applied_onboarding_fee_kind TEXT,
  applied_onboarding_fee_value NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((duration_weeks IS NULL) != (duration_months IS NULL))
);

-- Customer payments table for payment records
CREATE TABLE public.customer_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.payment_packages(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ NOT NULL,
  amount_currency TEXT NOT NULL DEFAULT 'GBP',
  amount_value NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'card',
  status TEXT NOT NULL DEFAULT 'succeeded',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payout periods table for individual payout periods
CREATE TABLE public.payout_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.payment_packages(id) ON DELETE CASCADE,
  period_index INTEGER NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  gross_portion_currency TEXT NOT NULL DEFAULT 'GBP',
  gross_portion_amount NUMERIC(10,2) NOT NULL,
  commission_deduction_currency TEXT NOT NULL DEFAULT 'GBP', 
  commission_deduction_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_payable_currency TEXT NOT NULL DEFAULT 'GBP',
  net_payable_amount NUMERIC(10,2) NOT NULL,
  approval_status approval_status_enum NOT NULL DEFAULT 'pending',
  approval_opened_at TIMESTAMPTZ NOT NULL,
  approval_deadline_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  rejection_attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(package_id, period_index)
);

-- Payout disbursements table for actual payouts to trainers
CREATE TABLE public.payout_disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_period_id UUID NOT NULL REFERENCES public.payout_periods(id) ON DELETE CASCADE,
  stripe_transfer_id TEXT,
  disbursed_at TIMESTAMPTZ NOT NULL,
  amount_currency TEXT NOT NULL DEFAULT 'GBP',
  amount_value NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'succeeded',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(payout_period_id)
);

-- Payment statements audit table
CREATE TABLE public.payment_statement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.payment_packages(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_role TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  statement_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_membership_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_statement_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_settings
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view platform settings" ON public.platform_settings
  FOR SELECT USING (true);

-- RLS Policies for trainer_membership_settings
CREATE POLICY "Trainers can manage their own membership settings" ON public.trainer_membership_settings
  FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Admins can manage all membership settings" ON public.trainer_membership_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payment_packages
CREATE POLICY "Users can view packages they're involved in" ON public.payment_packages
  FOR SELECT USING (auth.uid() = trainer_id OR auth.uid() = customer_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create payment packages" ON public.payment_packages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Trainers and customers can update their packages" ON public.payment_packages
  FOR UPDATE USING (auth.uid() = trainer_id OR auth.uid() = customer_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for customer_payments
CREATE POLICY "Users can view payments for their packages" ON public.customer_payments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.payment_packages pp 
    WHERE pp.id = package_id AND (pp.trainer_id = auth.uid() OR pp.customer_id = auth.uid())
  ) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage customer payments" ON public.customer_payments
  FOR ALL USING (true);

-- RLS Policies for payout_periods
CREATE POLICY "Users can view payout periods for their packages" ON public.payout_periods
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.payment_packages pp 
    WHERE pp.id = package_id AND (pp.trainer_id = auth.uid() OR pp.customer_id = auth.uid())
  ) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers and admins can approve/reject periods" ON public.payout_periods
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.payment_packages pp 
    WHERE pp.id = package_id AND pp.customer_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage payout periods" ON public.payout_periods
  FOR INSERT WITH CHECK (true);

-- RLS Policies for payout_disbursements
CREATE POLICY "Users can view disbursements for their packages" ON public.payout_disbursements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.payout_periods pp
    JOIN public.payment_packages pkg ON pkg.id = pp.package_id
    WHERE pp.id = payout_period_id AND (pkg.trainer_id = auth.uid() OR pkg.customer_id = auth.uid())
  ) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage payout disbursements" ON public.payout_disbursements
  FOR ALL USING (true);

-- RLS Policies for payment_statement_views
CREATE POLICY "Users can view their own statement views" ON public.payment_statement_views
  FOR SELECT USING (auth.uid() = viewer_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create statement views" ON public.payment_statement_views
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_payment_packages_trainer_id ON public.payment_packages(trainer_id);
CREATE INDEX idx_payment_packages_customer_id ON public.payment_packages(customer_id);
CREATE INDEX idx_customer_payments_package_id ON public.customer_payments(package_id);
CREATE INDEX idx_payout_periods_package_id ON public.payout_periods(package_id);
CREATE INDEX idx_payout_periods_approval_status ON public.payout_periods(approval_status);
CREATE INDEX idx_payout_periods_approval_deadline ON public.payout_periods(approval_deadline_at);
CREATE INDEX idx_payout_disbursements_period_id ON public.payout_disbursements(payout_period_id);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_trainer_membership_settings_updated_at
  BEFORE UPDATE ON public.trainer_membership_settings  
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_payment_packages_updated_at
  BEFORE UPDATE ON public.payment_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_customer_payments_updated_at
  BEFORE UPDATE ON public.customer_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_payout_periods_updated_at
  BEFORE UPDATE ON public.payout_periods
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_payout_disbursements_updated_at
  BEFORE UPDATE ON public.payout_disbursements
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_updated_at();