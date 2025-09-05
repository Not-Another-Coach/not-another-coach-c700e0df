-- Activity Consolidation Migration
-- Phase 1: Create consolidated enhanced system activities

-- First, let's see current system activities for reference
-- This migration will replace 51 duplicated activities with 17 enhanced ones

-- Create temporary mapping for the consolidation
CREATE TEMP TABLE activity_consolidation_mapping AS 
SELECT 
  old_id,
  new_activity_name,
  new_categories,
  new_activity_type,
  new_description,
  new_guidance
FROM (
  VALUES 
    -- Mapping old activities to new consolidated ones
    ('Initial Consultation', ARRAY['Discovery', 'Assessment', 'Goal Setting'], 'appointment', 
     'Comprehensive initial consultation to understand client goals, assess current fitness level, and establish training foundation',
     'Schedule a thorough consultation session to understand your client''s fitness goals, health history, and preferences. Use this time to build rapport and set clear expectations.'),
    
    ('Client Questionnaire', ARRAY['Onboarding', 'Assessment', 'Health & Safety'], 'survey',
     'Comprehensive questionnaire covering health history, lifestyle, preferences, and fitness goals',
     'Collect essential client information through structured questionnaires. Include health screening, lifestyle assessment, and goal clarification questions.'),
     
    ('Assessment Session', ARRAY['Assessment', 'Onboarding'], 'appointment',
     'Physical fitness assessment including movement screening, strength testing, and baseline measurements',
     'Conduct comprehensive fitness assessment including movement quality, strength baseline, flexibility, and any specific performance metrics relevant to client goals.'),
     
    ('Progress Documentation', ARRAY['Tracking Tools', 'Client Expectations', 'Onboarding'], 'file_upload',
     'Photo documentation, measurements, and progress tracking for accountability and motivation',
     'Guide clients through proper progress documentation including photos, measurements, and performance metrics. Establish consistent tracking methods.'),
     
    ('Custom Training Plan', ARRAY['Training Programs', 'Onboarding', 'Coaching'], 'training_content',
     'Personalized workout program designed specifically for client goals and fitness level',
     'Create and deliver customized training programs tailored to client goals, fitness level, and available equipment. Include progressive overload and periodization principles.'),
     
    ('Nutrition Guidance', ARRAY['Nutrition', 'Education', 'Coaching'], 'training_content',
     'Nutritional guidance, meal planning, and dietary recommendations to support fitness goals',
     'Provide evidence-based nutrition guidance including meal planning, macro tracking, and lifestyle-specific dietary recommendations to support training goals.'),
     
    ('Progress Check-ins', ARRAY['Communication', 'Tracking Tools', 'Ongoing Support'], 'appointment',
     'Regular progress review sessions to assess advancement and adjust programs as needed',
     'Schedule regular check-in sessions to review progress, address challenges, provide motivation, and make necessary program adjustments.'),
     
    ('Educational Content', ARRAY['Education', 'Resources', 'Coaching'], 'training_content',
     'Educational materials, guides, and resources to support client learning and development',
     'Share relevant educational content including exercise tutorials, nutrition guides, and lifestyle modification resources to empower client understanding.'),
     
    ('Progress Tracking', ARRAY['Tracking Tools', 'Analytics', 'Client Expectations'], 'task',
     'Systematic tracking of fitness metrics, performance improvements, and goal achievement',
     'Implement consistent tracking systems for monitoring client progress including workout logs, performance metrics, and goal achievement milestones.'),
     
    ('Session Scheduling', ARRAY['Communication', 'Sessions'], 'appointment',
     'Scheduling and managing training sessions, consultations, and check-in appointments',
     'Coordinate and manage all client appointments including training sessions, consultations, and progress reviews with clear scheduling protocols.'),
     
    ('Communication Support', ARRAY['Communication', 'Ongoing Support'], 'task',
     'Ongoing communication support through messaging, calls, and regular check-ins',
     'Maintain regular communication with clients through preferred channels to provide support, answer questions, and maintain accountability.'),
     
    ('Food Journal Review', ARRAY['Nutrition', 'Tracking Tools', 'Coaching'], 'file_upload',
     'Review and analysis of client food journals and dietary tracking for optimization',
     'Regularly review client food journals and dietary logs to provide feedback, identify patterns, and suggest improvements to support goals.'),
     
    ('Accountability Check', ARRAY['Accountability', 'Communication', 'Client Expectations'], 'task',
     'Regular accountability measures to ensure client commitment and program adherence',
     'Implement accountability systems including check-ins, commitment tracking, and gentle enforcement of agreed-upon expectations.'),
     
    ('Lifestyle Integration', ARRAY['Lifestyle', 'Coaching', 'Habit Building'], 'task',
     'Support for integrating fitness and health habits into client''s daily lifestyle',
     'Help clients seamlessly integrate fitness routines and healthy habits into their existing lifestyle for sustainable long-term success.'),
     
    ('Motivational Support', ARRAY['Motivation', 'Ongoing Support', 'Mental Health'], 'task',
     'Ongoing motivational support, encouragement, and mindset coaching',
     'Provide consistent motivational support including positive reinforcement, mindset coaching, and strategies to overcome obstacles.'),
     
    ('Form Analysis', ARRAY['Exercise Technique', 'Safety', 'Coaching'], 'task',
     'Exercise form analysis and technique correction for safety and effectiveness',
     'Analyze and correct exercise technique through video review, in-person coaching, and detailed feedback to ensure safe and effective training.'),
     
    ('Goal Review', ARRAY['Goal Setting', 'Planning', 'Assessment'], 'task',
     'Regular review and adjustment of fitness goals based on progress and changing priorities',
     'Periodically review and adjust client goals based on progress, life changes, and evolving priorities to maintain relevance and motivation.')
) AS mapping(new_activity_name, new_categories, new_activity_type, new_description, new_guidance);

-- Delete existing system activities to avoid conflicts
DELETE FROM trainer_onboarding_activities WHERE is_system = true;

-- Insert the 17 consolidated enhanced system activities
INSERT INTO trainer_onboarding_activities (
  trainer_id, 
  activity_name, 
  description, 
  category,
  activity_type,
  completion_method,
  instructions,
  guidance_html,
  is_system,
  is_active,
  display_order,
  default_due_days,
  default_sla_days,
  appointment_config,
  survey_config,
  content_config,
  upload_config
) VALUES 
-- 1. Initial Consultation
(NULL, 'Initial Consultation', 
 'Comprehensive initial consultation to understand client goals, assess current fitness level, and establish training foundation',
 'Discovery', 'appointment', 'trainer',
 'Schedule a thorough consultation session to understand your client''s fitness goals, health history, and preferences.',
 '<p>Use this initial consultation to:</p><ul><li>Build rapport and trust</li><li>Understand client goals and motivations</li><li>Review health history and limitations</li><li>Set clear expectations for the coaching relationship</li><li>Establish communication preferences</li></ul>',
 true, true, 1, 0, 1,
 '{"duration_minutes": 60, "buffer_minutes": 15, "booking_window_days": 14, "cancellation_hours": 24}',
 '{}', '{}', '{}'),

-- 2. Client Questionnaire  
(NULL, 'Client Questionnaire',
 'Comprehensive questionnaire covering health history, lifestyle, preferences, and fitness goals',
 'Onboarding', 'survey', 'client',
 'Complete detailed questionnaire covering health history, lifestyle factors, and fitness preferences.',
 '<p>This questionnaire helps us understand:</p><ul><li>Medical history and current health status</li><li>Previous fitness experience</li><li>Lifestyle factors affecting training</li><li>Specific goals and expectations</li><li>Preferences for training style and communication</li></ul>',
 true, true, 2, 3, 2,
 '{}',
 '{"questions": [{"type": "text", "question": "Health History"}, {"type": "scale", "question": "Current Fitness Level"}, {"type": "multiple_choice", "question": "Training Preferences"}], "required_completion": true}',
 '{}', '{}'),

-- 3. Assessment Session
(NULL, 'Assessment Session',
 'Physical fitness assessment including movement screening, strength testing, and baseline measurements',
 'Assessment', 'appointment', 'trainer',
 'Conduct comprehensive fitness assessment including movement quality and baseline measurements.',
 '<p>Assessment should include:</p><ul><li>Movement screening and flexibility assessment</li><li>Strength and endurance baseline testing</li><li>Body composition measurements</li><li>Specific sport/goal-related assessments</li><li>Identification of limitations or imbalances</li></ul>',
 true, true, 3, 7, 3,
 '{"duration_minutes": 90, "buffer_minutes": 30, "booking_window_days": 21, "cancellation_hours": 48}',
 '{}', '{}', '{}'),

-- 4. Progress Documentation
(NULL, 'Progress Documentation',
 'Photo documentation, measurements, and progress tracking for accountability and motivation',
 'Tracking Tools', 'file_upload', 'client',
 'Document baseline and ongoing progress through photos, measurements, and performance metrics.',
 '<p>Proper progress documentation includes:</p><ul><li>Consistent photo angles and lighting</li><li>Regular body measurements</li><li>Performance metric tracking</li><li>Progress photo comparisons</li><li>Measurement log maintenance</li></ul>',
 true, true, 4, 0, 1,
 '{}', '{}', '{}',
 '{"accepted_formats": ["image/*", "pdf"], "max_file_size_mb": 10, "max_files": 5, "required_fields": ["photos", "measurements"]}'),

-- 5. Custom Training Plan
(NULL, 'Custom Training Plan',
 'Personalized workout program designed specifically for client goals and fitness level',
 'Training Programs', 'training_content', 'trainer',
 'Create and deliver a fully customized training program based on assessment results and client goals.',
 '<p>Your custom training plan includes:</p><ul><li>Progressive workout structure</li><li>Exercise selection based on goals and limitations</li><li>Clear instructions and technique notes</li><li>Progression protocols</li><li>Adaptation guidelines</li></ul>',
 true, true, 5, 7, 5,
 '{}', '{}',
 '{"content_types": ["workout_plan", "exercise_library", "progression_guide"], "delivery_format": "digital", "update_frequency": "weekly"}',
 '{}'),

-- 6. Nutrition Guidance  
(NULL, 'Nutrition Guidance',
 'Nutritional guidance, meal planning, and dietary recommendations to support fitness goals',
 'Nutrition', 'training_content', 'trainer',
 'Receive personalized nutrition guidance including meal planning and dietary recommendations.',
 '<p>Nutrition guidance covers:</p><ul><li>Macro and calorie recommendations</li><li>Meal planning strategies</li><li>Food choice optimization</li><li>Timing recommendations</li><li>Supplement guidance if needed</li></ul>',
 true, true, 6, 7, 5,
 '{}', '{}',
 '{"content_types": ["meal_plan", "nutrition_guide", "macro_calculator"], "delivery_format": "digital", "update_frequency": "bi-weekly"}',
 '{}'),

-- 7. Progress Check-ins
(NULL, 'Progress Check-ins',
 'Regular progress review sessions to assess advancement and adjust programs as needed',
 'Communication', 'appointment', 'trainer',
 'Schedule regular check-in sessions to review progress and make program adjustments.',
 '<p>Progress check-ins include:</p><ul><li>Review of workout completion and performance</li><li>Assessment of goal progress</li><li>Program modifications as needed</li><li>Motivation and problem-solving support</li><li>Next phase planning</li></ul>',
 true, true, 7, 14, 7,
 '{"duration_minutes": 30, "buffer_minutes": 10, "booking_window_days": 7, "cancellation_hours": 24}',
 '{}', '{}', '{}'),

-- 8. Educational Content
(NULL, 'Educational Content',
 'Educational materials, guides, and resources to support client learning and development',
 'Education', 'training_content', 'trainer',
 'Access educational resources to deepen understanding of fitness and nutrition principles.',
 '<p>Educational content provides:</p><ul><li>Exercise technique tutorials</li><li>Nutrition education materials</li><li>Lifestyle optimization guides</li><li>Science-based fitness information</li><li>Habit formation strategies</li></ul>',
 true, true, 8, 0, 3,
 '{}', '{}',
 '{"content_types": ["video_tutorial", "written_guide", "infographic"], "delivery_format": "digital", "update_frequency": "monthly"}',
 '{}'),

-- 9. Progress Tracking
(NULL, 'Progress Tracking',
 'Systematic tracking of fitness metrics, performance improvements, and goal achievement',
 'Tracking Tools', 'task', 'client',
 'Maintain consistent tracking of workouts, progress metrics, and goal achievement.',
 '<p>Progress tracking involves:</p><ul><li>Workout log completion</li><li>Performance metric recording</li><li>Goal milestone tracking</li><li>Adherence monitoring</li><li>Pattern identification</li></ul>',
 true, true, 9, 0, 2,
 '{}', '{}', '{}', '{}'),

-- 10. Session Scheduling  
(NULL, 'Session Scheduling',
 'Scheduling and managing training sessions, consultations, and check-in appointments',
 'Communication', 'appointment', 'client',
 'Schedule and manage all training sessions and appointments with proper notice and coordination.',
 '<p>Session scheduling includes:</p><ul><li>Advance booking of training sessions</li><li>Cancellation and rescheduling protocols</li><li>Session preparation reminders</li><li>Calendar management</li><li>Attendance tracking</li></ul>',
 true, true, 10, 0, 1,
 '{"duration_minutes": 60, "buffer_minutes": 15, "booking_window_days": 30, "cancellation_hours": 24}',
 '{}', '{}', '{}'),

-- 11. Communication Support
(NULL, 'Communication Support',
 'Ongoing communication support through messaging, calls, and regular check-ins',
 'Communication', 'task', 'trainer',
 'Maintain regular communication to provide support, answer questions, and ensure accountability.',
 '<p>Communication support includes:</p><ul><li>Regular check-in messages</li><li>Quick question responses</li><li>Motivational support</li><li>Program clarification</li><li>Problem-solving assistance</li></ul>',
 true, true, 11, 0, 2,
 '{}', '{}', '{}', '{}'),

-- 12. Food Journal Review
(NULL, 'Food Journal Review',
 'Review and analysis of client food journals and dietary tracking for optimization',
 'Nutrition', 'file_upload', 'client',
 'Submit food journals for review and receive feedback on dietary choices and patterns.',
 '<p>Food journal review provides:</p><ul><li>Dietary pattern analysis</li><li>Nutritional adequacy assessment</li><li>Improvement suggestions</li><li>Goal alignment evaluation</li><li>Habit formation support</li></ul>',
 true, true, 12, 7, 3,
 '{}', '{}', '{}',
 '{"accepted_formats": ["image/*", "pdf", "csv"], "max_file_size_mb": 5, "max_files": 7, "required_fields": ["daily_logs"]}'),

-- 13. Accountability Check
(NULL, 'Accountability Check',
 'Regular accountability measures to ensure client commitment and program adherence',
 'Accountability', 'task', 'trainer',
 'Regular accountability check-ins to review commitment levels and program adherence.',
 '<p>Accountability checks cover:</p><ul><li>Workout completion review</li><li>Goal progress assessment</li><li>Habit formation evaluation</li><li>Challenge identification</li><li>Commitment reinforcement</li></ul>',
 true, true, 13, 7, 3,
 '{}', '{}', '{}', '{}'),

-- 14. Lifestyle Integration
(NULL, 'Lifestyle Integration',
 'Support for integrating fitness and health habits into client''s daily lifestyle',
 'Lifestyle', 'task', 'trainer',
 'Integrate fitness routines and healthy habits seamlessly into your existing lifestyle.',
 '<p>Lifestyle integration focuses on:</p><ul><li>Habit stacking strategies</li><li>Time management optimization</li><li>Environmental modifications</li><li>Social support systems</li><li>Sustainable routine development</li></ul>',
 true, true, 14, 14, 7,
 '{}', '{}', '{}', '{}'),

-- 15. Motivational Support
(NULL, 'Motivational Support',
 'Ongoing motivational support, encouragement, and mindset coaching',
 'Motivation', 'task', 'trainer',
 'Receive ongoing motivational support and mindset coaching to overcome challenges.',
 '<p>Motivational support includes:</p><ul><li>Regular encouragement and positive reinforcement</li><li>Obstacle identification and problem-solving</li><li>Mindset coaching and reframing</li><li>Celebration of achievements</li><li>Resilience building strategies</li></ul>',
 true, true, 15, 0, 2,
 '{}', '{}', '{}', '{}'),

-- 16. Form Analysis
(NULL, 'Form Analysis',
 'Exercise form analysis and technique correction for safety and effectiveness',
 'Exercise Technique', 'task', 'trainer',
 'Receive detailed analysis of exercise technique with corrections for optimal performance and safety.',
 '<p>Form analysis provides:</p><ul><li>Video-based technique review</li><li>Detailed correction feedback</li><li>Safety consideration highlights</li><li>Progressive technique development</li><li>Performance optimization tips</li></ul>',
 true, true, 16, 3, 2,
 '{}', '{}', '{}', '{}'),

-- 17. Goal Review
(NULL, 'Goal Review',
 'Regular review and adjustment of fitness goals based on progress and changing priorities',
 'Goal Setting', 'task', 'trainer',
 'Periodically review and adjust fitness goals to maintain relevance and motivation.',
 '<p>Goal review sessions include:</p><ul><li>Progress evaluation against current goals</li><li>Goal relevance and priority assessment</li><li>Adjustment of timelines and targets</li><li>New goal identification</li><li>Motivation and commitment renewal</li></ul>',
 true, true, 17, 30, 14,
 '{}', '{}', '{}', '{}');

-- Update any existing template assignments to use the new system activities
-- This ensures continuity for trainers who might have used old system activities

-- Create audit log for this major change
INSERT INTO admin_actions_log (admin_id, target_user_id, action_type, action_details, reason)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'system_activity_consolidation',
  jsonb_build_object(
    'old_activity_count', (SELECT COUNT(*) FROM trainer_onboarding_activities WHERE is_system = true),
    'new_activity_count', 17,
    'consolidation_date', now()
  ),
  'Consolidated 51+ duplicate system activities into 17 enhanced activities with multiple categories and enhanced features';