-- Create the missing alerts for the existing coach selection request
INSERT INTO public.alerts (
  alert_type,
  title,
  content,
  created_by,
  target_audience,
  metadata,
  is_active
) VALUES 
(
  'coach_selection_request',
  'New Coach Selection Request',
  'ClientLou ClientWhitton has selected you as their coach for 30 Private PT (Online) (Copy) ($900)',
  'f5562940-ccc4-40c2-b8dd-8f8c22311003', -- trainer_id
  jsonb_build_object('coaches', jsonb_build_array('f5562940-ccc4-40c2-b8dd-8f8c22311003')),
  jsonb_build_object(
    'client_id', '04531ef3-6ce9-47a7-9f70-3eb87ead08c3',
    'trainer_id', 'f5562940-ccc4-40c2-b8dd-8f8c22311003',
    'request_id', '61aa642d-4b55-4df2-842f-4bb62d00a252',
    'package_name', '30 Private PT (Online) (Copy)',
    'package_price', 900,
    'client_message', null
  ),
  true
),
(
  'coach_selection_sent',
  'Coach Selection Request Sent',
  'Your request to work with TrainerLou TrainerWhitton has been sent successfully',
  '04531ef3-6ce9-47a7-9f70-3eb87ead08c3', -- client_id
  jsonb_build_object('clients', jsonb_build_array('04531ef3-6ce9-47a7-9f70-3eb87ead08c3')),
  jsonb_build_object(
    'client_id', '04531ef3-6ce9-47a7-9f70-3eb87ead08c3',
    'trainer_id', 'f5562940-ccc4-40c2-b8dd-8f8c22311003',
    'request_id', '61aa642d-4b55-4df2-842f-4bb62d00a252',
    'package_name', '30 Private PT (Online) (Copy)',
    'package_price', 900
  ),
  true
);