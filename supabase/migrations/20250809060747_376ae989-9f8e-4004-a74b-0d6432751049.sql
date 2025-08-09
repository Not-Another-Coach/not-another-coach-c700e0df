-- Create public bucket for guidance images (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-public', 'onboarding-public', true)
ON CONFLICT (id) DO NOTHING;