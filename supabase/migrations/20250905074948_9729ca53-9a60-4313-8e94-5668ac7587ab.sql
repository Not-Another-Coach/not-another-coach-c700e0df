-- Check if we have any system activities
SELECT COUNT(*) as system_count FROM trainer_onboarding_activities WHERE is_system = true;

-- Insert some basic system activities if none exist
INSERT INTO trainer_onboarding_activities (activity_name, category, is_system, trainer_id, description) VALUES
('Weekly check-ins', 'coaching_style', true, null, 'Regular progress meetings with clients'),
('Custom workout plans', 'services', true, null, 'Personalized exercise programs'),
('Nutrition guidance', 'services', true, null, 'Dietary advice and meal planning'),
('Progress tracking', 'support', true, null, 'Monitor client achievements and metrics'),
('WhatsApp support', 'approach', true, null, 'Quick communication via messaging'),
('Form analysis', 'methodology', true, null, 'Video review of exercise technique'),
('Goal setting sessions', 'approach', true, null, 'Collaborative objective planning'),
('Monthly assessments', 'tracking', true, null, 'Regular fitness evaluations'),
('Habit coaching', 'methodology', true, null, 'Building sustainable lifestyle changes'),
('24/7 support', 'support', true, null, 'Round-the-clock client assistance'),
('Food diary review', 'expectations', true, null, 'Clients maintain detailed food logs'),
('Session attendance', 'requirements', true, null, 'Commitment to scheduled appointments'),
('Progress photos', 'commitment', true, null, 'Regular visual progress documentation'),
('Open communication', 'expectations', true, null, 'Honest feedback and questions'),
('Home workout completion', 'requirements', true, null, 'Complete assigned exercises between sessions')
ON CONFLICT DO NOTHING;