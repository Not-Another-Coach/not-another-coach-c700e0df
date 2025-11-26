-- Create the qualification-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('qualification-proofs', 'qualification-proofs', false)
ON CONFLICT (id) DO NOTHING;