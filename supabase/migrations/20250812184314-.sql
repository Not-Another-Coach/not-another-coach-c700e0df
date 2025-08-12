-- Phase 1: Consent & Compliance Infrastructure (Fixed)

-- Add consent tracking columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_marketing boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_service boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_timestamp timestamp with time zone DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_version text DEFAULT '1.0';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_policy_version text DEFAULT '1.0';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version text DEFAULT '1.0';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_retention_until timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_unsubscribed_at timestamp with time zone;

-- Create message publish ledger table for audit trails
CREATE TABLE IF NOT EXISTS public.message_publish_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_type text NOT NULL, -- 'email', 'sms', 'push', 'onboarding_template'
  recipient_id uuid NOT NULL,
  sender_id uuid,
  template_id uuid,
  template_version text,
  consent_snapshot jsonb NOT NULL DEFAULT '{}', -- Snapshot of consent state at publish time
  legal_basis text NOT NULL DEFAULT 'consent', -- 'consent', 'legitimate_interest', 'contract'
  content_hash text, -- SHA256 hash of content for integrity
  delivery_status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  delivery_provider text, -- 'supabase', 'sendgrid', 'twilio', etc.
  delivery_provider_id text, -- External provider message ID
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  failed_at timestamp with time zone,
  failure_reason text,
  retry_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on message publish ledger
ALTER TABLE public.message_publish_ledger ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own message records" ON public.message_publish_ledger;
DROP POLICY IF EXISTS "Admins can view all message records" ON public.message_publish_ledger;
DROP POLICY IF EXISTS "System can create message records" ON public.message_publish_ledger;

-- Create RLS policies for message publish ledger
CREATE POLICY "Users can view their own message records" 
ON public.message_publish_ledger 
FOR SELECT 
USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Admins can view all message records" 
ON public.message_publish_ledger 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create message records" 
ON public.message_publish_ledger 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_ledger_recipient ON public.message_publish_ledger(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_ledger_correlation ON public.message_publish_ledger(correlation_id);
CREATE INDEX IF NOT EXISTS idx_message_ledger_template ON public.message_publish_ledger(template_id);
CREATE INDEX IF NOT EXISTS idx_message_ledger_sent_at ON public.message_publish_ledger(sent_at);

-- Create consent audit table for tracking consent changes
CREATE TABLE IF NOT EXISTS public.consent_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  consent_type text NOT NULL, -- 'marketing', 'service', 'cookies', 'data_processing'
  previous_value boolean,
  new_value boolean NOT NULL,
  legal_basis text NOT NULL DEFAULT 'consent',
  consent_method text NOT NULL, -- 'signup', 'profile_update', 'email_preference', 'cookie_banner'
  consent_version text NOT NULL DEFAULT '1.0',
  ip_address inet,
  user_agent text,
  source_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on consent audit log
ALTER TABLE public.consent_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own consent history" ON public.consent_audit_log;
DROP POLICY IF EXISTS "Admins can view all consent history" ON public.consent_audit_log;
DROP POLICY IF EXISTS "System can create consent records" ON public.consent_audit_log;

-- Create RLS policies for consent audit log
CREATE POLICY "Users can view their own consent history" 
ON public.consent_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent history" 
ON public.consent_audit_log 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create consent records" 
ON public.consent_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_consent_audit_user_id ON public.consent_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_created_at ON public.consent_audit_log(created_at);

-- Create data retention policy table
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_category text NOT NULL, -- 'profiles', 'messages', 'analytics', 'audit_logs'
  retention_period_months integer NOT NULL,
  legal_basis text NOT NULL, -- 'consent', 'legitimate_interest', 'legal_obligation'
  auto_purge_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(data_category)
);

-- Enable RLS on data retention policies
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can manage retention policies" ON public.data_retention_policies;

-- Create RLS policy for data retention policies
CREATE POLICY "Admins can manage retention policies" 
ON public.data_retention_policies 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default retention policies
INSERT INTO public.data_retention_policies (data_category, retention_period_months, legal_basis) VALUES
('profiles', 84, 'consent'), -- 7 years for profiles
('messages', 36, 'legitimate_interest'), -- 3 years for messages
('audit_logs', 84, 'legal_obligation'), -- 7 years for audit logs
('analytics', 12, 'legitimate_interest'), -- 1 year for analytics
('onboarding_progress', 36, 'contract') -- 3 years for onboarding data
ON CONFLICT (data_category) DO NOTHING;

-- Create function to log consent changes
CREATE OR REPLACE FUNCTION public.log_consent_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log marketing consent changes
  IF OLD.consent_marketing IS DISTINCT FROM NEW.consent_marketing THEN
    INSERT INTO public.consent_audit_log (
      user_id, consent_type, previous_value, new_value, 
      consent_method, consent_version
    ) VALUES (
      NEW.id, 'marketing', OLD.consent_marketing, NEW.consent_marketing,
      'profile_update', NEW.consent_version
    );
  END IF;
  
  -- Log service consent changes
  IF OLD.consent_service IS DISTINCT FROM NEW.consent_service THEN
    INSERT INTO public.consent_audit_log (
      user_id, consent_type, previous_value, new_value,
      consent_method, consent_version
    ) VALUES (
      NEW.id, 'service', OLD.consent_service, NEW.consent_service,
      'profile_update', NEW.consent_version
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for consent changes
DROP TRIGGER IF EXISTS trigger_log_consent_changes ON public.profiles;
CREATE TRIGGER trigger_log_consent_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_consent_change();

-- Create function to capture consent snapshot for message publishing
CREATE OR REPLACE FUNCTION public.create_consent_snapshot(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  consent_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'marketing', consent_marketing,
    'service', consent_service,
    'consent_timestamp', consent_timestamp,
    'consent_version', consent_version,
    'privacy_policy_version', privacy_policy_version,
    'terms_version', terms_version,
    'captured_at', now()
  ) INTO consent_data
  FROM public.profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(consent_data, '{}'::jsonb);
END;
$$;

-- Create function to check if user can receive marketing messages
CREATE OR REPLACE FUNCTION public.can_send_marketing_message(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_send boolean := false;
BEGIN
  SELECT consent_marketing AND marketing_unsubscribed_at IS NULL 
  INTO can_send
  FROM public.profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(can_send, false);
END;
$$;

-- Update updated_at trigger for new tables
DROP TRIGGER IF EXISTS update_message_ledger_updated_at ON public.message_publish_ledger;
CREATE TRIGGER update_message_ledger_updated_at
  BEFORE UPDATE ON public.message_publish_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_retention_policies_updated_at ON public.data_retention_policies;
CREATE TRIGGER update_retention_policies_updated_at
  BEFORE UPDATE ON public.data_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();