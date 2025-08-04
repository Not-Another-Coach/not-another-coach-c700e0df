-- Add RLS policy to allow trainers to see their own shortlisted entries
CREATE POLICY "Trainers can view their own shortlisted entries" 
ON public.shortlisted_trainers 
FOR SELECT 
USING (auth.uid()::text = trainer_id);