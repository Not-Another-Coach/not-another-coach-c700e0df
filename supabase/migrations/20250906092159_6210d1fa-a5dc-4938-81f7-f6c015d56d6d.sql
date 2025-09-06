-- Add foreign key relationship between custom_specialty_requests and profiles
ALTER TABLE public.custom_specialty_requests 
ADD CONSTRAINT custom_specialty_requests_trainer_id_fkey 
FOREIGN KEY (trainer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also add foreign key for reviewed_by field to track which admin reviewed
ALTER TABLE public.custom_specialty_requests 
ADD CONSTRAINT custom_specialty_requests_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;