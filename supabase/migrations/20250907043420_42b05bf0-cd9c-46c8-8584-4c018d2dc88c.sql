-- =============================================
-- PERFORMANCE OPTIMIZATION FOR RLS POLICIES - PART 1
-- Create security definer functions to avoid repeated lookups
-- =============================================

-- 1. Create optimized user type lookup function
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS TEXT AS $$
  SELECT user_type FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- 2. Create optimized admin check function (enhance existing one)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- 3. Create function to check if user has specific role efficiently
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = _role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- 4. Create function to check target audience efficiently
CREATE OR REPLACE FUNCTION public.user_in_target_audience(audience_json jsonb)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_type TEXT;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check for 'all' audience
  IF audience_json ? 'all' THEN
    RETURN true;
  END IF;
  
  -- Check for admin audience and user is admin
  IF audience_json ? 'admins' AND public.current_user_has_role('admin'::app_role) THEN
    RETURN true;
  END IF;
  
  -- Get user type once
  SELECT user_type INTO current_user_type FROM public.profiles WHERE id = current_user_id;
  
  -- Check type-based audiences
  IF current_user_type = 'trainer' AND audience_json ? 'trainers' THEN
    -- Check if specific trainers or all trainers
    IF audience_json->'trainers' = '"all"'::jsonb THEN
      RETURN true;
    ELSIF jsonb_typeof(audience_json->'trainers') = 'array' THEN
      RETURN audience_json->'trainers' @> to_jsonb(current_user_id);
    END IF;
  END IF;
  
  IF current_user_type = 'client' AND audience_json ? 'clients' THEN
    -- Check if specific clients or all clients
    IF audience_json->'clients' = '"all"'::jsonb THEN
      RETURN true;
    ELSIF jsonb_typeof(audience_json->'clients') = 'array' THEN
      RETURN audience_json->'clients' @> to_jsonb(current_user_id);
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER STABLE SET search_path = public;

-- 5. Create function to check if user owns template
CREATE OR REPLACE FUNCTION public.user_owns_template(template_id uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.onboarding_templates 
    WHERE id = template_id AND trainer_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- 6. Create function to check if user owns conversation
CREATE OR REPLACE FUNCTION public.user_in_conversation(conversation_id uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND (client_id = auth.uid() OR trainer_id = auth.uid())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;