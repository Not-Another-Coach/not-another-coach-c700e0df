-- Fix the admin role issue causing 502 errors
-- Grant admin role to the admin user who is experiencing permission issues

-- First, ensure the admin user has the admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('bce82fa4-e36b-4114-95ec-6262e1a10117', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also grant admin role to the other admin-type user if needed
-- This covers users whose profile shows user_type='admin' but don't have the role
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE p.user_type = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'admin'
  )
ON CONFLICT (user_id, role) DO NOTHING;