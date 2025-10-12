-- Insert default visibility settings for package_ways_of_working
INSERT INTO system_visibility_defaults (content_type, stage_group, visibility_state, created_by)
VALUES 
  ('package_ways_of_working', 'browsing', 'hidden', NULL),
  ('package_ways_of_working', 'liked', 'hidden', NULL),
  ('package_ways_of_working', 'shortlisted', 'visible', NULL),
  ('package_ways_of_working', 'discovery_process', 'visible', NULL),
  ('package_ways_of_working', 'committed', 'visible', NULL),
  ('package_ways_of_working', 'rejected', 'hidden', NULL),
  ('package_ways_of_working', 'guest', 'hidden', NULL)
ON CONFLICT (content_type, stage_group) DO NOTHING;