-- Add RLS policies for the user_roles table to enable role checking

-- Policy to allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy to allow admins to view all roles 
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated  
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy to allow admins to manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy to allow system/service operations (for initial admin setup)
CREATE POLICY "System can manage roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);