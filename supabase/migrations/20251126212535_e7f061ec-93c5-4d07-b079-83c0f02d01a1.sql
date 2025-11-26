-- Allow public (anonymous) users to view gallery images for demo trainers only
CREATE POLICY "Public can view demo trainer images"
ON trainer_uploaded_images
FOR SELECT
TO anon
USING (
  trainer_id IN (
    '1051dd7c-ee79-48fd-b287-2cbe7483f9f7',  -- Trainer 4
    '5193e290-0570-4d77-b46a-e0e21ea0aac3'   -- Trainer 5
  )
);