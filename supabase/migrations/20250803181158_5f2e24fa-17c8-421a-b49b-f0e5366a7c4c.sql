-- Add phone and payment fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS card_last_four TEXT,
ADD COLUMN IF NOT EXISTS card_type TEXT,
ADD COLUMN IF NOT EXISTS card_expiry_month INTEGER,
ADD COLUMN IF NOT EXISTS card_expiry_year INTEGER,
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.card_last_four IS 'Last 4 digits of payment card (masked for security)';
COMMENT ON COLUMN public.profiles.card_type IS 'Type of payment card (Visa, Mastercard, etc.)';
COMMENT ON COLUMN public.profiles.card_expiry_month IS 'Card expiry month (1-12)';
COMMENT ON COLUMN public.profiles.card_expiry_year IS 'Card expiry year';
COMMENT ON COLUMN public.profiles.billing_address IS 'JSON object containing billing address details';