-- Create enum for highlight types
CREATE TYPE highlight_type AS ENUM ('popular', 'specialist');

-- Add highlight_type column to specialties table
ALTER TABLE public.specialties 
ADD COLUMN highlight_type highlight_type NULL;

-- Add highlight_type column to training_types table  
ALTER TABLE public.training_types
ADD COLUMN highlight_type highlight_type NULL;

-- Create index for better performance on highlight_type queries
CREATE INDEX idx_specialties_highlight_type ON public.specialties(highlight_type);
CREATE INDEX idx_training_types_highlight_type ON public.training_types(highlight_type);

-- Pre-populate existing specialties based on current keyword logic
UPDATE public.specialties 
SET highlight_type = 'popular'
WHERE LOWER(name) LIKE '%strength training%' 
   OR LOWER(name) LIKE '%weight loss%' 
   OR LOWER(name) LIKE '%personal training%'
   OR LOWER(name) LIKE '%1-on-1%'
   OR LOWER(name) LIKE '%cardio%';

UPDATE public.specialties 
SET highlight_type = 'specialist'
WHERE LOWER(name) LIKE '%pre/postnatal%'
   OR LOWER(name) LIKE '%prenatal%'
   OR LOWER(name) LIKE '%postnatal%'
   OR LOWER(name) LIKE '%rehabilitation%'
   OR LOWER(name) LIKE '%sports performance%'
   OR LOWER(name) LIKE '%athletic performance%'
   OR LOWER(name) LIKE '%injury prevention%';

-- Pre-populate existing training_types based on current keyword logic
UPDATE public.training_types 
SET highlight_type = 'popular'
WHERE LOWER(name) LIKE '%strength training%' 
   OR LOWER(name) LIKE '%weight loss%' 
   OR LOWER(name) LIKE '%personal training%'
   OR LOWER(name) LIKE '%1-on-1%'
   OR LOWER(name) LIKE '%cardio%';

UPDATE public.training_types 
SET highlight_type = 'specialist'
WHERE LOWER(name) LIKE '%pre/postnatal%'
   OR LOWER(name) LIKE '%prenatal%'
   OR LOWER(name) LIKE '%postnatal%'
   OR LOWER(name) LIKE '%rehabilitation%'
   OR LOWER(name) LIKE '%sports performance%'
   OR LOWER(name) LIKE '%athletic performance%'
   OR LOWER(name) LIKE '%injury prevention%';