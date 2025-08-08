-- Add system/user flag to activities and adjust constraints + RLS
DO $$ BEGIN
  -- Add is_system column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'trainer_onboarding_activities' AND column_name = 'is_system'
  ) THEN
    ALTER TABLE public.trainer_onboarding_activities
      ADD COLUMN is_system boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Make trainer_id nullable to allow system-wide activities
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'trainer_onboarding_activities' AND column_name = 'trainer_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.trainer_onboarding_activities
      ALTER COLUMN trainer_id DROP NOT NULL;
  END IF;
END $$;

-- Unique index for system activities (activity_name unique among system items)
CREATE UNIQUE INDEX IF NOT EXISTS ux_trainer_onboarding_activities_system_unique
  ON public.trainer_onboarding_activities (activity_name)
  WHERE is_system = true;

-- Unique index for user activities per trainer (if not already present)
-- This doesn't conflict with an existing constraint, it will be skipped if same name exists.
CREATE UNIQUE INDEX IF NOT EXISTS ux_trainer_onboarding_activities_user_unique
  ON public.trainer_onboarding_activities (trainer_id, activity_name)
  WHERE is_system = false;

-- Enable RLS
ALTER TABLE public.trainer_onboarding_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies if any conflict (optional safe drop)
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='trainer_onboarding_activities' AND policyname='select_system_or_own_activities';
  IF FOUND THEN EXECUTE 'DROP POLICY select_system_or_own_activities ON public.trainer_onboarding_activities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='trainer_onboarding_activities' AND policyname='insert_own_activities';
  IF FOUND THEN EXECUTE 'DROP POLICY insert_own_activities ON public.trainer_onboarding_activities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='trainer_onboarding_activities' AND policyname='update_own_activities';
  IF FOUND THEN EXECUTE 'DROP POLICY update_own_activities ON public.trainer_onboarding_activities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='trainer_onboarding_activities' AND policyname='delete_own_activities';
  IF FOUND THEN EXECUTE 'DROP POLICY delete_own_activities ON public.trainer_onboarding_activities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='trainer_onboarding_activities' AND policyname='admin_manage_system_activities_insert';
  IF FOUND THEN EXECUTE 'DROP POLICY admin_manage_system_activities_insert ON public.trainer_onboarding_activities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='trainer_onboarding_activities' AND policyname='admin_manage_system_activities_update';
  IF FOUND THEN EXECUTE 'DROP POLICY admin_manage_system_activities_update ON public.trainer_onboarding_activities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='trainer_onboarding_activities' AND policyname='admin_manage_system_activities_delete';
  IF FOUND THEN EXECUTE 'DROP POLICY admin_manage_system_activities_delete ON public.trainer_onboarding_activities'; END IF;
END $$;

-- Read policy: anyone can see system items; owners see their items; admins see all
CREATE POLICY select_system_or_own_activities
  ON public.trainer_onboarding_activities
  FOR SELECT
  USING (
    is_system = true
    OR trainer_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- Trainers insert their own activities (non-system)
CREATE POLICY insert_own_activities
  ON public.trainer_onboarding_activities
  FOR INSERT
  WITH CHECK (
    is_system = false AND trainer_id = auth.uid()
  );

-- Trainers update/delete their own non-system activities
CREATE POLICY update_own_activities
  ON public.trainer_onboarding_activities
  FOR UPDATE
  USING (
    is_system = false AND trainer_id = auth.uid()
  );

CREATE POLICY delete_own_activities
  ON public.trainer_onboarding_activities
  FOR DELETE
  USING (
    is_system = false AND trainer_id = auth.uid()
  );

-- Admins manage system activities
CREATE POLICY admin_manage_system_activities_insert
  ON public.trainer_onboarding_activities
  FOR INSERT
  WITH CHECK (
    is_system = true AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY admin_manage_system_activities_update
  ON public.trainer_onboarding_activities
  FOR UPDATE
  USING (
    is_system = true AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY admin_manage_system_activities_delete
  ON public.trainer_onboarding_activities
  FOR DELETE
  USING (
    is_system = true AND public.has_role(auth.uid(), 'admin')
  );