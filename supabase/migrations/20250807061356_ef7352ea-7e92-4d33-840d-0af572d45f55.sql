-- Update admin user email to louise.whitton@outlook.com
-- First find the admin user ID
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID from profiles table
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE user_type = 'admin' 
    LIMIT 1;
    
    -- Update the email in auth.users table directly since we're in a migration
    IF admin_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET email = 'louise.whitton@outlook.com',
            updated_at = now()
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Updated admin user email to louise.whitton@outlook.com';
    ELSE
        RAISE NOTICE 'No admin user found';
    END IF;
END $$;