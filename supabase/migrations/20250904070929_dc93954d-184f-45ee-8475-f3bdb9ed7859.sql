-- Update the trainer-documents bucket to be public for certificate viewing
UPDATE storage.buckets SET public = true WHERE id = 'trainer-documents';

-- Update the policies to allow public viewing of certificates while maintaining security
DROP POLICY IF EXISTS "Trainers can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all trainer documents" ON storage.objects;

-- Create new policies that allow public viewing but restricted uploads
CREATE POLICY "Public can view trainer documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trainer-documents');

CREATE POLICY "Admins can manage all trainer documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'trainer-documents' AND has_role(auth.uid(), 'admin'::app_role));