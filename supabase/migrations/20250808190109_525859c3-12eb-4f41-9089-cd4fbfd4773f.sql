-- Add description field to trainer activities
ALTER TABLE public.trainer_onboarding_activities
ADD COLUMN IF NOT EXISTS description text;

-- Optional: ensure updated_at exists to reflect edits (add if table uses it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trainer_onboarding_activities' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.trainer_onboarding_activities
    ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Optional trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_trainer_onboarding_activities_updated_at'
  ) THEN
    CREATE TRIGGER trg_trainer_onboarding_activities_updated_at
    BEFORE UPDATE ON public.trainer_onboarding_activities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;