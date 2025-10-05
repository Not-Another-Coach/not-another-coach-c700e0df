-- Add public SELECT policy for trainer_uploaded_images where is_selected_for_display = true
-- This allows browsing users (including anonymous) to view selected trainer images

CREATE POLICY "Anyone can view selected uploaded images"
ON public.trainer_uploaded_images
FOR SELECT
TO public
USING (is_selected_for_display = true);