-- Create membership_plan_definitions table
CREATE TABLE public.membership_plan_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  monthly_price_cents INTEGER NOT NULL,
  has_package_commission BOOLEAN NOT NULL DEFAULT false,
  commission_fee_type TEXT,
  commission_fee_value_percent NUMERIC(5,2),
  commission_fee_value_flat_cents INTEGER,
  is_available_to_new_trainers BOOLEAN NOT NULL DEFAULT true,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraints
ALTER TABLE public.membership_plan_definitions
  ADD CONSTRAINT valid_commission_fee_type 
  CHECK (commission_fee_type IS NULL OR commission_fee_type IN ('percentage', 'flat'));

ALTER TABLE public.membership_plan_definitions
  ADD CONSTRAINT valid_commission_percentage 
  CHECK (commission_fee_value_percent IS NULL OR (commission_fee_value_percent >= 0 AND commission_fee_value_percent <= 100));

-- Enable RLS
ALTER TABLE public.membership_plan_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all membership plans"
  ON public.membership_plan_definitions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active plans"
  ON public.membership_plan_definitions
  FOR SELECT
  USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_membership_plan_definitions_updated_at
  BEFORE UPDATE ON public.membership_plan_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_membership_updated_at();

-- Add foreign key to trainer_membership if plan_definition_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'trainer_membership' 
    AND column_name = 'plan_definition_id'
  ) THEN
    ALTER TABLE public.trainer_membership
      ADD CONSTRAINT fk_trainer_membership_plan_definition
      FOREIGN KEY (plan_definition_id)
      REFERENCES public.membership_plan_definitions(id);
  END IF;
END $$;

-- Seed initial membership plans
INSERT INTO public.membership_plan_definitions (
  plan_name,
  plan_type,
  display_name,
  description,
  monthly_price_cents,
  has_package_commission,
  commission_fee_type,
  commission_fee_value_percent,
  is_available_to_new_trainers
) VALUES 
(
  'low',
  'low',
  'Starter Plan',
  'Perfect for trainers just starting out. Lower monthly fee with commission on package sales.',
  2900,
  true,
  'percentage',
  15.00,
  true
),
(
  'high',
  'high',
  'Professional Plan',
  'For established trainers. Higher monthly fee with no commission on packages.',
  9900,
  false,
  NULL,
  NULL,
  true
);