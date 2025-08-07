-- Create verification request tracking table
CREATE TABLE public.trainer_verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status verification_request_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE NULL,
  reviewed_by UUID NULL REFERENCES public.profiles(id),
  admin_notes TEXT NULL,
  rejection_reason TEXT NULL,
  documents_provided JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add verification request status enum
CREATE TYPE public.verification_request_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'resubmitted');

-- Recreate the table with proper enum
DROP TABLE IF EXISTS public.trainer_verification_requests;
CREATE TABLE public.trainer_verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status verification_request_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE NULL,
  reviewed_by UUID NULL REFERENCES public.profiles(id),
  admin_notes TEXT NULL,
  rejection_reason TEXT NULL,
  documents_provided JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for verification requests
ALTER TABLE public.trainer_verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view their own verification requests"
ON public.trainer_verification_requests
FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create their own verification requests"
ON public.trainer_verification_requests
FOR INSERT
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own pending requests"
ON public.trainer_verification_requests
FOR UPDATE
USING (auth.uid() = trainer_id AND status = 'pending');

CREATE POLICY "Admins can manage all verification requests"
ON public.trainer_verification_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update profiles table verification status tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS admin_review_notes TEXT NULL;

-- Create function to handle verification status updates
CREATE OR REPLACE FUNCTION public.update_trainer_verification_status(
  p_trainer_id UUID,
  p_status verification_status_enum,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can update verification status
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update verification status';
  END IF;

  -- Update the profile verification status
  UPDATE public.profiles
  SET 
    verification_status = p_status,
    admin_review_notes = p_admin_notes,
    updated_at = now()
  WHERE id = p_trainer_id AND user_type = 'trainer';

  -- Update the verification request
  UPDATE public.trainer_verification_requests
  SET
    status = CASE 
      WHEN p_status = 'verified' THEN 'approved'::verification_request_status
      WHEN p_status = 'rejected' THEN 'rejected'::verification_request_status
      ELSE 'under_review'::verification_request_status
    END,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    admin_notes = p_admin_notes,
    rejection_reason = p_rejection_reason,
    updated_at = now()
  WHERE trainer_id = p_trainer_id AND status != 'approved' AND status != 'rejected';

  -- Log the admin action
  PERFORM public.log_admin_action(
    p_trainer_id,
    'verification_status_update',
    jsonb_build_object(
      'new_status', p_status,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    'Verification status updated'
  );

  -- Create notification for trainer
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  VALUES (
    'verification_update',
    CASE 
      WHEN p_status = 'verified' THEN 'Profile Verified!'
      WHEN p_status = 'rejected' THEN 'Verification Rejected'
      ELSE 'Verification Under Review'
    END,
    CASE 
      WHEN p_status = 'verified' THEN 'Congratulations! Your trainer profile has been verified and is now published.'
      WHEN p_status = 'rejected' THEN COALESCE('Your verification was rejected. Reason: ' || p_rejection_reason, 'Your verification was rejected. Please review the feedback and resubmit.')
      ELSE 'Your verification request is currently under review by our admin team.'
    END,
    jsonb_build_object('trainers', jsonb_build_array(p_trainer_id)),
    jsonb_build_object(
      'trainer_id', p_trainer_id,
      'verification_status', p_status,
      'admin_notes', p_admin_notes
    ),
    true
  );
END;
$$;

-- Create function for trainers to request verification
CREATE OR REPLACE FUNCTION public.request_trainer_verification(
  p_documents JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user is a trainer
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = current_user_id AND user_type = 'trainer'
  ) THEN
    RAISE EXCEPTION 'Only trainers can request verification';
  END IF;

  -- Check if there's already a pending request
  IF EXISTS (
    SELECT 1 FROM public.trainer_verification_requests 
    WHERE trainer_id = current_user_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending verification request';
  END IF;

  -- Create verification request
  INSERT INTO public.trainer_verification_requests (
    trainer_id,
    documents_provided,
    status
  )
  VALUES (
    current_user_id,
    p_documents,
    'pending'
  )
  RETURNING id INTO request_id;

  -- Update profile with request timestamp
  UPDATE public.profiles
  SET 
    verification_requested_at = now(),
    verification_documents = p_documents,
    updated_at = now()
  WHERE id = current_user_id;

  -- Create admin notification
  INSERT INTO public.alerts (
    alert_type,
    title,
    content,
    target_audience,
    metadata,
    is_active
  )
  SELECT 
    'verification_request',
    'New Verification Request',
    (SELECT COALESCE(first_name || ' ' || last_name, 'A trainer') FROM public.profiles WHERE id = current_user_id) || ' has submitted a verification request.',
    jsonb_build_object('admins', jsonb_build_array(p.id)),
    jsonb_build_object(
      'trainer_id', current_user_id,
      'request_id', request_id
    ),
    true
  FROM public.profiles p
  JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE ur.role = 'admin';

  RETURN request_id;
END;
$$;

-- Add trigger to update updated_at column
CREATE OR REPLACE TRIGGER update_trainer_verification_requests_updated_at
BEFORE UPDATE ON public.trainer_verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();