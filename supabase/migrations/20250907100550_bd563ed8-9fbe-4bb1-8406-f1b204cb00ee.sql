-- Update Trainer 4's profile to test accuracy confirmation
UPDATE public.profiles 
SET accuracy_confirmed = true, 
    terms_agreed = true,
    updated_at = now()
WHERE id = '1051dd7c-ee79-48fd-b287-2cbe7483f9f7';