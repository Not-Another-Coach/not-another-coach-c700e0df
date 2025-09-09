-- Remove unused content types from the enum
-- First create the new enum with only the used types
CREATE TYPE content_type_new AS ENUM (
  'profile_image',
  'testimonial_images', 
  'gallery_images'
);

-- Update the table to use the new enum
ALTER TABLE trainer_visibility_settings 
ALTER COLUMN content_type TYPE content_type_new 
USING content_type::text::content_type_new;

-- Drop the old enum and rename the new one
DROP TYPE content_type;
ALTER TYPE content_type_new RENAME TO content_type;