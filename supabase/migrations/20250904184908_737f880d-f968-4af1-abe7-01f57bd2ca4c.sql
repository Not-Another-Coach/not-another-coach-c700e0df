-- Make the client-photos bucket public since testimonials are displayed publicly
UPDATE storage.buckets SET public = true WHERE id = 'client-photos';

-- Add RLS policies for the client-photos bucket to allow proper access
CREATE POLICY "Anyone can view client photos" ON storage.objects
FOR SELECT USING (bucket_id = 'client-photos');

CREATE POLICY "Authenticated users can upload client photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own client photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own client photos" ON storage.objects
FOR DELETE USING (bucket_id = 'client-photos' AND auth.role() = 'authenticated');