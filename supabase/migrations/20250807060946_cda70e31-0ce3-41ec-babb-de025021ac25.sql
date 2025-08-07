-- Comprehensive cleanup: Delete all trainers and clients while preserving admins
-- This will clean up all user data except for admin accounts

-- First, get all non-admin user IDs to clean up
-- Delete from tables with foreign key dependencies first

-- Delete user-specific data
DELETE FROM user_alert_interactions 
WHERE user_id IN (
  SELECT id FROM profiles WHERE user_type IN ('trainer', 'client')
);

DELETE FROM user_journey_tracking 
WHERE user_id IN (
  SELECT id FROM profiles WHERE user_type IN ('trainer', 'client')
);

DELETE FROM login_history 
WHERE user_id IN (
  SELECT id FROM profiles WHERE user_type IN ('trainer', 'client')
);

-- Delete trainer-specific data
DELETE FROM package_ways_of_working 
WHERE trainer_id IN (
  SELECT id FROM profiles WHERE user_type = 'trainer'
);

DELETE FROM trainer_availability_settings 
WHERE trainer_id IN (
  SELECT id FROM profiles WHERE user_type = 'trainer'
);

DELETE FROM trainer_visibility_settings 
WHERE trainer_id IN (
  SELECT id FROM profiles WHERE user_type = 'trainer'
);

DELETE FROM coach_analytics 
WHERE trainer_id IN (
  SELECT id::text FROM profiles WHERE user_type = 'trainer'
);

-- Delete discovery call related data
DELETE FROM discovery_call_feedback_responses 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

DELETE FROM discovery_call_feedback_notifications 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

DELETE FROM discovery_call_feedback 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

DELETE FROM discovery_call_notes 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

DELETE FROM discovery_call_notifications 
WHERE discovery_call_id IN (
  SELECT id FROM discovery_calls 
  WHERE client_id IN (SELECT id FROM profiles WHERE user_type = 'client')
);

DELETE FROM discovery_calls 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

-- Delete messaging data
DELETE FROM messages 
WHERE conversation_id IN (
  SELECT id FROM conversations 
  WHERE client_id IN (SELECT id FROM profiles WHERE user_type = 'client')
);

DELETE FROM conversations 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

-- Delete engagement and selection data
DELETE FROM coach_selection_requests 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

DELETE FROM coach_waitlists 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

DELETE FROM client_trainer_engagement 
WHERE client_id IN (
  SELECT id FROM profiles WHERE user_type = 'client'
);

-- Delete user roles for non-admin users (keep admin roles)
DELETE FROM user_roles 
WHERE user_id IN (
  SELECT id FROM profiles WHERE user_type IN ('trainer', 'client')
) AND role != 'admin';

-- Finally, delete the profile records for trainers and clients
DELETE FROM profiles WHERE user_type IN ('trainer', 'client');

-- Delete from auth.users table for users who are no longer in profiles
-- This will clean up the auth records for deleted users
DELETE FROM auth.users 
WHERE id NOT IN (
  SELECT id FROM profiles WHERE user_type = 'admin'
);