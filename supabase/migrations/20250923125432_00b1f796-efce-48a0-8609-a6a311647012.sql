-- Fix missing profile for trainer2@mockinbox.com
INSERT INTO public.profiles (
    id,
    user_type,
    first_name,
    last_name,
    profile_published,
    is_verified,
    verification_status
)
VALUES (
    '57433c6b-2dfb-4000-955c-f5fca0c5888c',
    'trainer',
    'Trainer2',
    'Surname2', 
    true,
    true,
    'verified'
);