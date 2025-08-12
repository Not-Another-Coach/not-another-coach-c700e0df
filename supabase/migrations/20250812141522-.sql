-- Secure profiles table with RLS and granular policies
-- 1) Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Allow users to read their own profile
CREATE POLICY "Profiles: users select own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 3) Allow users to update their own profile
CREATE POLICY "Profiles: users update own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4) Allow users to insert their own profile (if created client-side)
CREATE POLICY "Profiles: users insert own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5) Admin override - full access
CREATE POLICY "Profiles: admins all"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6) Browsing: authenticated users can view published trainer profiles
CREATE POLICY "Profiles: browse published trainers"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND user_type = 'trainer'::user_type
  AND COALESCE(profile_published, false) = true
);

-- 7) Engagement-based access: clients <-> trainers can view each other when engaged
CREATE POLICY "Profiles: engaged visibility"
ON public.profiles
FOR SELECT
USING (
  -- Clients can view engaged trainer profiles
  (
    user_type = 'trainer'::user_type
    AND EXISTS (
      SELECT 1
      FROM public.client_trainer_engagement e
      WHERE e.client_id = auth.uid()
        AND e.trainer_id = public.profiles.id
    )
  )
  OR
  -- Trainers can view engaged client profiles
  (
    user_type = 'client'::user_type
    AND EXISTS (
      SELECT 1
      FROM public.client_trainer_engagement e
      WHERE e.trainer_id = auth.uid()
        AND e.client_id = public.profiles.id
    )
  )
);
