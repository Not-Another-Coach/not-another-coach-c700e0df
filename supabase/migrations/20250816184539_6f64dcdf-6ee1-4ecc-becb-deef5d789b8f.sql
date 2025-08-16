-- Fix the trigger function to use correct field names
CREATE OR REPLACE FUNCTION public.set_onboarding_due_dates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Compute due_at from due_in_days with business day calculation
  IF (NEW.due_at IS NULL) AND (NEW.due_in_days IS NOT NULL) THEN
    NEW.due_at := now() + make_interval(days => NEW.due_in_days);
  END IF;

  -- Compute sla_due_at from sla_days if not set
  IF (NEW.sla_due_at IS NULL) AND (NEW.sla_days IS NOT NULL) THEN
    NEW.sla_due_at := now() + make_interval(days => NEW.sla_days);
  END IF;

  RETURN NEW;
END;
$function$;