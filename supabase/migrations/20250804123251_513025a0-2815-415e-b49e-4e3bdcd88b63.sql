-- Grant admin role to the current trainer (Louise Whitton)
INSERT INTO public.user_roles (user_id, role)
VALUES ('4f90441a-20de-4f62-99aa-2440b12228dd', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also keep their trainer role
INSERT INTO public.user_roles (user_id, role)
VALUES ('4f90441a-20de-4f62-99aa-2440b12228dd', 'trainer')
ON CONFLICT (user_id, role) DO NOTHING;