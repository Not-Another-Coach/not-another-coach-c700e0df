-- Check all triggers on profiles table again, this time looking for AFTER triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_order
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
  AND action_timing = 'AFTER'
ORDER BY action_order;