-- Add admin SELECT policy for qualification-proofs bucket
CREATE POLICY "Admins can view all qualification certificates"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'qualification-proofs'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);