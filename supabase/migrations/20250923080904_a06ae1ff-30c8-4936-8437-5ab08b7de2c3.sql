-- Insert default visibility settings for guest stage
INSERT INTO system_visibility_defaults (content_type, stage_group, visibility_state, created_by) VALUES
  ('profile_image', 'guest', 'visible', '00000000-0000-0000-0000-000000000000'),
  ('basic_information', 'guest', 'visible', '00000000-0000-0000-0000-000000000000'),
  ('testimonial_images', 'guest', 'hidden', '00000000-0000-0000-0000-000000000000'),
  ('gallery_images', 'guest', 'hidden', '00000000-0000-0000-0000-000000000000'),
  ('pricing_discovery_call', 'guest', 'blurred', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (content_type, stage_group) DO NOTHING;