-- Create client-photos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-photos', 'client-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create permissive storage policies for client-photos bucket
CREATE POLICY "Allow authenticated users to upload client photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view client photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update client photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete client photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'client-photos' AND auth.role() = 'authenticated');