-- Remove any remaining 'waitlist' engagement stages and replace with 'browsing'
UPDATE client_trainer_engagement 
SET stage = 'browsing' 
WHERE stage = 'waitlist';