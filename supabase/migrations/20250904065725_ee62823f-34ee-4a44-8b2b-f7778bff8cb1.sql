-- Create storage bucket for trainer documents
INSERT INTO storage.buckets (id, name, public) VALUES ('trainer-documents', 'trainer-documents', false);

-- Create policies for trainer documents
CREATE POLICY "Trainers can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trainers can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trainers can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trainers can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all trainer documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trainer-documents' AND has_role(auth.uid(), 'admin'::app_role));