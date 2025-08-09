-- 1) Types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_visibility') THEN
    CREATE TYPE onboarding_visibility AS ENUM ('client', 'trainer', 'shared');
  END IF;
END $$;

-- 2) Enhance activities with defaults
ALTER TABLE IF EXISTS public.trainer_onboarding_activities
  ADD COLUMN IF NOT EXISTS guidance_html text,
  ADD COLUMN IF NOT EXISTS default_due_days integer,
  ADD COLUMN IF NOT EXISTS default_sla_days integer;

-- 3) Extend client_onboarding_progress for scheduling, attachments, visibility & SLA
ALTER TABLE IF EXISTS public.client_onboarding_progress
  ADD COLUMN IF NOT EXISTS due_in_days integer,
  ADD COLUMN IF NOT EXISTS due_at timestamptz,
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS allowed_attachments jsonb DEFAULT '{"photo": true, "file": true, "link": true, "max_files": 5, "max_per_file_mb": 10, "total_max_mb": 30}'::jsonb,
  ADD COLUMN IF NOT EXISTS visibility onboarding_visibility DEFAULT 'shared',
  ADD COLUMN IF NOT EXISTS sla_days integer,
  ADD COLUMN IF NOT EXISTS sla_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS overdue_alert_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_alert_sent_at timestamptz;

-- 4) Helper function to set computed dates
CREATE OR REPLACE FUNCTION public.set_onboarding_due_dates()
RETURNS trigger AS $$
BEGIN
  -- Compute due_at from due_in_days if due_at not explicitly set
  IF (NEW.due_at IS NULL) AND (NEW.due_in_days IS NOT NULL) THEN
    NEW.due_at := now() + make_interval(days => NEW.due_in_days);
  END IF;

  -- Compute sla_due_at from sla_days if not set
  IF (NEW.sla_due_at IS NULL) AND (NEW.sla_days IS NOT NULL) THEN
    NEW.sla_due_at := now() + make_interval(days => NEW.sla_days);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;

-- 5) Triggers on insert/update
DROP TRIGGER IF EXISTS trg_set_onboarding_due_dates_ins ON public.client_onboarding_progress;
CREATE TRIGGER trg_set_onboarding_due_dates_ins
BEFORE INSERT ON public.client_onboarding_progress
FOR EACH ROW EXECUTE FUNCTION public.set_onboarding_due_dates();

DROP TRIGGER IF EXISTS trg_set_onboarding_due_dates_upd ON public.client_onboarding_progress;
CREATE TRIGGER trg_set_onboarding_due_dates_upd
BEFORE UPDATE OF due_in_days, sla_days ON public.client_onboarding_progress
FOR EACH ROW EXECUTE FUNCTION public.set_onboarding_due_dates();

-- 6) Allow new alert types in alerts policy (system insert policy)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'System can create alerts'
  ) THEN
    DROP POLICY "System can create alerts" ON public.alerts;
  END IF;
END $$;

CREATE POLICY "System can create alerts"
ON public.alerts FOR INSERT
WITH CHECK (
  alert_type = ANY (ARRAY[
    'discovery_call_booked', 'discovery_call_cancelled', 'discovery_call_rescheduled',
    'coach_selection_request', 'coach_selection_sent', 'waitlist_joined',
    'verification_request', 'verification_update',
    'task_overdue', 'sla_breached'
  ])
);

-- 7) Storage bucket for onboarding attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding', 'onboarding', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects for 'onboarding' bucket
DO $$ BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'onboarding_select_owner'
  ) THEN
    CREATE POLICY onboarding_select_owner ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'onboarding' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'onboarding_insert_owner'
  ) THEN
    CREATE POLICY onboarding_insert_owner ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'onboarding' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'onboarding_update_owner'
  ) THEN
    CREATE POLICY onboarding_update_owner ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'onboarding' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        auth.uid()::text = (storage.foldername(name))[2]
      )
    )
    WITH CHECK (
      bucket_id = 'onboarding' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'onboarding_delete_owner'
  ) THEN
    CREATE POLICY onboarding_delete_owner ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'onboarding' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;
END $$;