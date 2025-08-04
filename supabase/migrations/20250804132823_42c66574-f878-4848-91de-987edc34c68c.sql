-- Add account status and management fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked', 'deactivated', 'banned')),
ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS suspended_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS suspended_reason text,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS communication_restricted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS communication_restricted_reason text,
ADD COLUMN IF NOT EXISTS force_password_reset boolean DEFAULT false;

-- Create admin actions log table
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL,
  target_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  action_type text NOT NULL,
  action_details jsonb DEFAULT '{}',
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create login history table
CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  login_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  success boolean NOT NULL DEFAULT true,
  failure_reason text
);

-- Enable RLS on new tables
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin actions log
CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert admin actions"
ON public.admin_actions_log
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = admin_id);

-- RLS policies for login history
CREATE POLICY "Admins can view all login history"
ON public.login_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own login history"
ON public.login_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history"
ON public.login_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_target_user_id uuid,
  p_action_type text,
  p_action_details jsonb DEFAULT '{}',
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can log actions
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can log actions';
  END IF;

  INSERT INTO public.admin_actions_log (admin_id, target_user_id, action_type, action_details, reason)
  VALUES (auth.uid(), p_target_user_id, p_action_type, p_action_details, p_reason);
END;
$$;

-- Function to suspend user
CREATE OR REPLACE FUNCTION public.suspend_user(
  p_user_id uuid,
  p_reason text,
  p_duration_days integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  suspend_until timestamp with time zone;
BEGIN
  -- Only admins can suspend users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can suspend users';
  END IF;

  -- Calculate suspension end date if duration provided
  IF p_duration_days IS NOT NULL THEN
    suspend_until := now() + (p_duration_days || ' days')::interval;
  END IF;

  -- Update user status
  UPDATE public.profiles
  SET 
    account_status = 'suspended',
    suspended_at = now(),
    suspended_until = suspend_until,
    suspended_reason = p_reason,
    updated_at = now()
  WHERE id = p_user_id;

  -- Log the action
  PERFORM public.log_admin_action(
    p_user_id,
    'suspend_user',
    jsonb_build_object('duration_days', p_duration_days, 'until', suspend_until),
    p_reason
  );
END;
$$;

-- Function to reactivate user
CREATE OR REPLACE FUNCTION public.reactivate_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can reactivate users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reactivate users';
  END IF;

  -- Update user status
  UPDATE public.profiles
  SET 
    account_status = 'active',
    suspended_at = NULL,
    suspended_until = NULL,
    suspended_reason = NULL,
    communication_restricted = false,
    communication_restricted_reason = NULL,
    updated_at = now()
  WHERE id = p_user_id;

  -- Log the action
  PERFORM public.log_admin_action(
    p_user_id,
    'reactivate_user',
    '{}',
    p_reason
  );
END;
$$;

-- Function to update admin notes
CREATE OR REPLACE FUNCTION public.update_admin_notes(
  p_user_id uuid,
  p_notes text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can update notes
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update notes';
  END IF;

  -- Update admin notes
  UPDATE public.profiles
  SET 
    admin_notes = p_notes,
    updated_at = now()
  WHERE id = p_user_id;

  -- Log the action
  PERFORM public.log_admin_action(
    p_user_id,
    'update_notes',
    jsonb_build_object('notes_length', length(p_notes)),
    'Admin notes updated'
  );
END;
$$;

-- Function to restrict communication
CREATE OR REPLACE FUNCTION public.restrict_communication(
  p_user_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can restrict communication
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can restrict communication';
  END IF;

  -- Update communication restriction
  UPDATE public.profiles
  SET 
    communication_restricted = true,
    communication_restricted_reason = p_reason,
    updated_at = now()
  WHERE id = p_user_id;

  -- Log the action
  PERFORM public.log_admin_action(
    p_user_id,
    'restrict_communication',
    '{}',
    p_reason
  );
END;
$$;