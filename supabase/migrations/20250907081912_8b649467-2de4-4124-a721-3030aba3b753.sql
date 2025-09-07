-- Force update Trainer 4's publication status (simplified)
UPDATE profiles 
SET profile_published = true
WHERE id = '1051dd7c-ee79-48fd-b287-2cbe7483f9f7'
RETURNING id, first_name, verification_status, is_verified, profile_published;