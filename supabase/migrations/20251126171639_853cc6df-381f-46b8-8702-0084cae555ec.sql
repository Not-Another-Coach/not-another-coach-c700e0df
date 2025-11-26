-- Fix search_path for new trigger functions to address security linter warnings

DROP FUNCTION IF EXISTS update_contact_info_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_contact_info_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_contact_info_timestamp
  BEFORE UPDATE ON public.contact_info
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_info_updated_at();

DROP FUNCTION IF EXISTS update_payment_methods_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_payment_methods_timestamp
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();

DROP FUNCTION IF EXISTS update_billing_addresses_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_billing_addresses_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_billing_addresses_timestamp
  BEFORE UPDATE ON public.billing_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_addresses_updated_at();