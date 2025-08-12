-- Fix the trigger to use correct field names
CREATE OR REPLACE FUNCTION public.set_onboarding_due_dates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
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
$$;

-- Now create sample onboarding steps for testing
INSERT INTO client_onboarding_progress (
  client_id,
  trainer_id,
  step_name,
  description,
  instructions,
  step_type,
  completion_method,
  requires_file_upload,
  display_order,
  status
) VALUES 
(
  '04531ef3-6ce9-47a7-9f70-3eb87ead08c3',
  'f5562940-ccc4-40c2-b8dd-8f8c22311003',
  'Complete Initial Assessment',
  'Please complete your initial fitness assessment to help us understand your starting point',
  'Fill out the attached form with your current fitness level, any injuries, and your specific goals. This helps us customize your training program.',
  'mandatory',
  'client',
  true,
  1,
  'pending'
),
(
  '04531ef3-6ce9-47a7-9f70-3eb87ead08c3',
  'f5562940-ccc4-40c2-b8dd-8f8c22311003',
  'Review Training Schedule',
  'Review and confirm your weekly training schedule with your trainer',
  'Your trainer will send you a proposed schedule. Please review and let them know if any adjustments are needed.',
  'mandatory',
  'trainer',
  false,
  2,
  'pending'
),
(
  '04531ef3-6ce9-47a7-9f70-3eb87ead08c3',
  'f5562940-ccc4-40c2-b8dd-8f8c22311003',
  'Set Up Training Equipment',
  'Ensure you have the necessary equipment for your online training sessions',
  'Check that you have: stable internet connection, camera, space to move, and any equipment specified by your trainer.',
  'optional',
  'client',
  false,
  3,
  'pending'
);

-- Create a template assignment notification
INSERT INTO alerts (
  alert_type,
  title,
  content,
  priority,
  target_audience,
  created_by,
  metadata
) VALUES (
  'template_assigned',
  'New Training Templates Assigned',
  'TrainerLou TrainerWhitton has assigned you new onboarding templates for your 30 Private PT (Online) package. Check your onboarding section to get started!',
  3,
  '["clients"]',
  'f5562940-ccc4-40c2-b8dd-8f8c22311003',
  '{"client_id": "04531ef3-6ce9-47a7-9f70-3eb87ead08c3", "trainer_id": "f5562940-ccc4-40c2-b8dd-8f8c22311003", "template_names": "Complete Initial Assessment, Review Training Schedule, Set Up Training Equipment", "package_name": "30 Private PT (Online) (Copy)", "action": "view_onboarding"}'
);