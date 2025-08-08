-- Remove next_available_date and availability_slots from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS next_available_date,
DROP COLUMN IF EXISTS availability_slots;