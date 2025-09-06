-- Fix system activity categories to match ways_of_working_categories
UPDATE trainer_onboarding_activities 
SET ways_of_working_category = 'Assessment'
WHERE is_system = true AND activity_name IN ('Assessment Session', 'Client Questionnaire');

UPDATE trainer_onboarding_activities 
SET ways_of_working_category = 'Planning'
WHERE is_system = true AND activity_name = 'Lifestyle Integration';

UPDATE trainer_onboarding_activities 
SET ways_of_working_category = 'Goal Setting'
WHERE is_system = true AND activity_name = 'Goal Review';

UPDATE trainer_onboarding_activities 
SET ways_of_working_category = 'First Week'
WHERE is_system = true AND activity_name IN ('Custom Training Plan', 'Initial Consultation', 'Nutrition Guidance');