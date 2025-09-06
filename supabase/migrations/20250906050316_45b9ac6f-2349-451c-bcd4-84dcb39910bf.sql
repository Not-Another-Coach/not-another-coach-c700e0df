-- Fix category mappings that reference non-existent template sections
-- Update "Client Expectations" to map to the "Commitments & Expectations" template section
UPDATE ways_of_working_categories 
SET section_key = 'commitments_expectations', 
    section_name = 'Commitments & Expectations',
    profile_section_key = 'client_expectations',
    updated_at = now()
WHERE activity_category = 'Client Expectations';

-- Update "What I Bring" to map to the "Trainer-Specific Approach" template section  
UPDATE ways_of_working_categories 
SET section_key = 'trainer_specific', 
    section_name = 'Trainer-Specific Approach',
    profile_section_key = 'what_i_provide',
    updated_at = now()
WHERE activity_category = 'What I Bring';