-- Check triggers on profiles table that might interfere with profile_published
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;