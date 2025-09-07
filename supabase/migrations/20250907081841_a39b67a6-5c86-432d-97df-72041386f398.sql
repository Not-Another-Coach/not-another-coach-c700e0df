-- Manually fix Trainer 4's publication status
UPDATE profiles 
SET profile_published = true
WHERE id = '1051dd7c-ee79-48fd-b287-2cbe7483f9f7' 
  AND verification_status = 'verified' 
  AND profile_published = false
  AND EXISTS (
    SELECT 1 FROM profile_publication_requests 
    WHERE trainer_id = '1051dd7c-ee79-48fd-b287-2cbe7483f9f7' AND status = 'approved'
  );