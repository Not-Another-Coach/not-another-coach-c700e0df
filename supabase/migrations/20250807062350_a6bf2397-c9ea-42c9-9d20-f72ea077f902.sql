-- Fix the admin login by ensuring password is properly set
-- Use the development password reset function we have

SELECT update_all_user_passwords_dev_simple();

-- Also ensure the user data is properly set
UPDATE auth.users 
SET 
    email = 'louise.whitton@outlook.com',
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'louise.whitton@outlook.com' OR id = '550e8400-e29b-41d4-a716-446655440006';