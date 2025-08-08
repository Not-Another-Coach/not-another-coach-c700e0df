-- Re-apply unique constraint (will succeed if not existing)
ALTER TABLE public.trainer_onboarding_activities
ADD CONSTRAINT unique_trainer_activity_name UNIQUE (trainer_id, activity_name);

-- Create or replace import function with correct ROW_COUNT handling
CREATE OR REPLACE FUNCTION public.import_activities_from_ways_of_working(p_trainer_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_trainer uuid := COALESCE(p_trainer_id, auth.uid());
  wf RECORD;
  item jsonb;
  inserted_count int := 0;
  v_text text;
  v_rows int;
BEGIN
  IF v_trainer IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;
  IF p_trainer_id IS NOT NULL AND p_trainer_id != auth.uid() AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  FOR wf IN SELECT * FROM public.package_ways_of_working WHERE trainer_id = v_trainer LOOP
    -- Onboarding items -> category 'Onboarding'
    FOR item IN SELECT jsonb_array_elements(COALESCE(wf.onboarding_items, '[]'::jsonb)) LOOP
      v_text := trim(both from item->>'text');
      IF v_text IS NOT NULL AND v_text <> '' THEN
        INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
        VALUES (v_trainer, v_text, 'Onboarding')
        ON CONFLICT ON CONSTRAINT unique_trainer_activity_name DO NOTHING;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        inserted_count := inserted_count + v_rows;
      END IF;
    END LOOP;

    -- First week items -> category 'First Week'
    FOR item IN SELECT jsonb_array_elements(COALESCE(wf.first_week_items, '[]'::jsonb)) LOOP
      v_text := trim(both from item->>'text');
      IF v_text IS NOT NULL AND v_text <> '' THEN
        INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
        VALUES (v_trainer, v_text, 'First Week')
        ON CONFLICT ON CONSTRAINT unique_trainer_activity_name DO NOTHING;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        inserted_count := inserted_count + v_rows;
      END IF;
    END LOOP;

    -- Ongoing structure -> category 'Ongoing Structure'
    FOR item IN SELECT jsonb_array_elements(COALESCE(wf.ongoing_structure_items, '[]'::jsonb)) LOOP
      v_text := trim(both from item->>'text');
      IF v_text IS NOT NULL AND v_text <> '' THEN
        INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
        VALUES (v_trainer, v_text, 'Ongoing Structure')
        ON CONFLICT ON CONSTRAINT unique_trainer_activity_name DO NOTHING;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        inserted_count := inserted_count + v_rows;
      END IF;
    END LOOP;

    -- Tracking tools -> category 'Tracking Tools'
    FOR item IN SELECT jsonb_array_elements(COALESCE(wf.tracking_tools_items, '[]'::jsonb)) LOOP
      v_text := trim(both from item->>'text');
      IF v_text IS NOT NULL AND v_text <> '' THEN
        INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
        VALUES (v_trainer, v_text, 'Tracking Tools')
        ON CONFLICT ON CONSTRAINT unique_trainer_activity_name DO NOTHING;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        inserted_count := inserted_count + v_rows;
      END IF;
    END LOOP;

    -- Client expectations -> category 'Client Expectations'
    FOR item IN SELECT jsonb_array_elements(COALESCE(wf.client_expectations_items, '[]'::jsonb)) LOOP
      v_text := trim(both from item->>'text');
      IF v_text IS NOT NULL AND v_text <> '' THEN
        INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
        VALUES (v_trainer, v_text, 'Client Expectations')
        ON CONFLICT ON CONSTRAINT unique_trainer_activity_name DO NOTHING;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        inserted_count := inserted_count + v_rows;
      END IF;
    END LOOP;

    -- What I bring -> category 'What I Bring'
    FOR item IN SELECT jsonb_array_elements(COALESCE(wf.what_i_bring_items, '[]'::jsonb)) LOOP
      v_text := trim(both from item->>'text');
      IF v_text IS NOT NULL AND v_text <> '' THEN
        INSERT INTO public.trainer_onboarding_activities (trainer_id, activity_name, category)
        VALUES (v_trainer, v_text, 'What I Bring')
        ON CONFLICT ON CONSTRAINT unique_trainer_activity_name DO NOTHING;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        inserted_count := inserted_count + v_rows;
      END IF;
    END LOOP;
  END LOOP;

  RETURN inserted_count;
END;
$$;