-- Direct password update for all users in development
-- This bypasses the authentication check for simplicity

DO $$
DECLARE
  user_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  -- Loop through all users and update their passwords
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email IS NOT NULL
  LOOP
    -- Update each user's password to Password123!
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Password123!', gen_salt('bf')),
      updated_at = now()
    WHERE id = user_record.id;
    
    updated_count := updated_count + 1;
    RAISE NOTICE 'Updated password for user: % (% of %)', user_record.email, updated_count, (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL);
  END LOOP;
  
  RAISE NOTICE 'Successfully updated passwords for % users to Password123!', updated_count;
END $$;