-- Create separate tables for sensitive personal data
-- This protects against data exposure from the profiles table public policies

-- 1. Contact Information Table
CREATE TABLE public.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contact info"
  ON public.contact_info
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all contact info"
  ON public.contact_info
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Payment Methods Table
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_last_four text,
  card_type text,
  card_expiry_month integer,
  card_expiry_year integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payment methods"
  ON public.payment_methods
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment methods"
  ON public.payment_methods
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Billing Addresses Table
CREATE TABLE public.billing_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  billing_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.billing_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own billing addresses"
  ON public.billing_addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all billing addresses"
  ON public.billing_addresses
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Migrate existing data from profiles to new tables
-- Phone data
INSERT INTO public.contact_info (user_id, phone)
SELECT id, phone FROM public.profiles WHERE phone IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Card data
INSERT INTO public.payment_methods (user_id, card_last_four, card_type, card_expiry_month, card_expiry_year)
SELECT id, card_last_four, card_type, card_expiry_month, card_expiry_year 
FROM public.profiles 
WHERE card_last_four IS NOT NULL OR card_type IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Billing address data
INSERT INTO public.billing_addresses (user_id, billing_address)
SELECT id, billing_address FROM public.profiles WHERE billing_address IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 5. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_contact_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_info_timestamp
  BEFORE UPDATE ON public.contact_info
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_info_updated_at();

CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_methods_timestamp
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();

CREATE OR REPLACE FUNCTION update_billing_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_addresses_timestamp
  BEFORE UPDATE ON public.billing_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_addresses_updated_at();

-- 6. Drop sensitive columns from profiles table (after data migration)
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS card_last_four,
  DROP COLUMN IF EXISTS card_type,
  DROP COLUMN IF EXISTS card_expiry_month,
  DROP COLUMN IF EXISTS card_expiry_year,
  DROP COLUMN IF EXISTS billing_address,
  DROP COLUMN IF EXISTS billing_city,
  DROP COLUMN IF EXISTS billing_postcode;

-- Add security comments
COMMENT ON TABLE public.contact_info IS 'User contact information - strict RLS: only user or admin can access';
COMMENT ON TABLE public.payment_methods IS 'User payment card details - strict RLS: only user or admin can access';
COMMENT ON TABLE public.billing_addresses IS 'User billing addresses - strict RLS: only user or admin can access';
COMMENT ON TABLE public.profiles IS 'User profiles - sensitive data moved to separate tables with strict access controls';