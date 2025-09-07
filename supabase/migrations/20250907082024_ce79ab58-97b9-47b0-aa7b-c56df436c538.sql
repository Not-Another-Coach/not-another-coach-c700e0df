-- Check the definition of the auto_publish_on_verification function
SELECT prosrc FROM pg_proc WHERE proname = 'auto_publish_on_verification';