-- RLS Policies for qualification-proofs bucket

-- Trainers can upload their own qualification certificates
CREATE POLICY "Trainers can upload their own qualification certificates"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'qualification-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Trainers can view their own qualification certificates
CREATE POLICY "Trainers can view their own qualification certificates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'qualification-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Trainers can update their own qualification certificates
CREATE POLICY "Trainers can update their own qualification certificates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'qualification-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Trainers can delete their own qualification certificates
CREATE POLICY "Trainers can delete their own qualification certificates"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'qualification-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);