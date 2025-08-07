-- Test the create_coach_selection_request function
-- First let's check the current auth context
SELECT auth.uid() as current_user_id;

-- Try to call the function manually with Sophie's client ID and Lou's trainer ID
SELECT create_coach_selection_request(
  '4f90441a-20de-4f62-99aa-2440b12228dd'::uuid, -- Lou Whitton's trainer ID
  '1754302710257'::text, -- Package ID
  '1'::text, -- Package name  
  50::numeric, -- Package price
  '1 session'::text, -- Package duration
  'Test message'::text -- Client message
) as result;