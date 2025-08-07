-- Delete the old admin user louise.whitton@outlook.com
DELETE FROM auth.users 
WHERE email = 'louise.whitton@outlook.com';

-- Also clean up any related profile data if it exists
DELETE FROM public.profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'louise.whitton@outlook.com'
);

-- Ensure the new user lou.whitton@outlook.com has proper admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'lou.whitton@outlook.com'
ON CONFLICT (user_id, role) DO NOTHING;