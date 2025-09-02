-- Fix role alignment issues - grant missing primary roles to users
-- This ensures all users have their basic role corresponding to their user_type

-- Grant client role to all users with user_type = 'client' who don't have it
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'client'::app_role
FROM public.profiles p
WHERE p.user_type = 'client'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'client'
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant trainer role to all users with user_type = 'trainer' who don't have it
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'trainer'::app_role
FROM public.profiles p
WHERE p.user_type = 'trainer'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'trainer'
  )
ON CONFLICT (user_id, role) DO NOTHING;