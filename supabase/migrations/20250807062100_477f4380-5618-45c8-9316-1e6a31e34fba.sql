-- Create a reliable way to access the system by ensuring admin credentials are correct
-- Reset admin user password and ensure everything is properly set up

DO $$
DECLARE
    admin_user_id UUID := '550e8400-e29b-41d4-a716-446655440006';
BEGIN
    -- Update the auth.users table with the correct email and reset password
    UPDATE auth.users 
    SET 
        email = 'louise.whitton@outlook.com',
        encrypted_password = crypt('Password123!', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now(),
        raw_user_meta_data = jsonb_build_object(
            'email_verified', true,
            'first_name', 'Admin',
            'last_name', 'User',
            'user_type', 'admin'
        )
    WHERE id = admin_user_id;
    
    -- Ensure the profile exists and is correct
    INSERT INTO profiles (id, user_type, first_name, last_name, account_status)
    VALUES (admin_user_id, 'admin', 'Admin', 'User', 'active')
    ON CONFLICT (id) DO UPDATE SET
        user_type = 'admin',
        first_name = 'Admin',
        last_name = 'User',
        account_status = 'active';
    
    -- Ensure admin role exists
    INSERT INTO user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin user setup completed. Email: louise.whitton@outlook.com, Password: Password123!';
END $$;