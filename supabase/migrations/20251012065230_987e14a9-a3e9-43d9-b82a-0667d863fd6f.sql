-- Enable RLS and add safe, scoped policies for package_ways_of_working so clients can read public entries
-- and post-match entries when engaged with the trainer, while trainers/admins can manage their own.

-- 1) Enable RLS (safe to run multiple times)
ALTER TABLE IF EXISTS public.package_ways_of_working ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing conflicting policies if they exist (idempotent)
DO $$ BEGIN
  IF to_regclass('public.package_ways_of_working') IS NOT NULL THEN
    BEGIN
      DROP POLICY IF EXISTS "Public can view public package ways of working" ON public.package_ways_of_working;
    EXCEPTION WHEN undefined_object THEN NULL; END;
    BEGIN
      DROP POLICY IF EXISTS "Clients can view post-match package ways of working" ON public.package_ways_of_working;
    EXCEPTION WHEN undefined_object THEN NULL; END;
    BEGIN
      DROP POLICY IF EXISTS "Trainers can manage their package ways of working" ON public.package_ways_of_working;
    EXCEPTION WHEN undefined_object THEN NULL; END;
    BEGIN
      DROP POLICY IF EXISTS "Admins can manage all package ways of working" ON public.package_ways_of_working;
    EXCEPTION WHEN undefined_object THEN NULL; END;
  END IF;
END $$;

-- 3) Read policies
-- Anyone can read entries explicitly marked as public
CREATE POLICY "Public can view public package ways of working"
ON public.package_ways_of_working
FOR SELECT
USING (
  visibility::text = 'public'
);

-- Clients can read entries marked post_match when they have sufficient engagement with this trainer
CREATE POLICY "Clients can view post-match package ways of working"
ON public.package_ways_of_working
FOR SELECT
USING (
  visibility::text = 'post_match'
  AND EXISTS (
    SELECT 1 FROM public.client_trainer_engagement e
    WHERE e.client_id = auth.uid()
      AND e.trainer_id = package_ways_of_working.trainer_id
      AND e.stage IN (
        'matched', 'discovery_completed', 'agreed', 'payment_pending', 'active_client'
      )
  )
);

-- 4) Write policies
-- Trainers manage their own rows
CREATE POLICY "Trainers can manage their package ways of working"
ON public.package_ways_of_working
FOR ALL
USING (auth.uid() = trainer_id)
WITH CHECK (auth.uid() = trainer_id);

-- Admins manage all
CREATE POLICY "Admins can manage all package ways of working"
ON public.package_ways_of_working
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
