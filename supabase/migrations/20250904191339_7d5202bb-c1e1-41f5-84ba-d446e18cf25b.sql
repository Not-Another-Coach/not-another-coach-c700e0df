-- Migration to fix existing testimonial image URLs
-- Convert signed URLs to permanent public URLs and fix path duplication

CREATE OR REPLACE FUNCTION fix_testimonial_image_urls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  testimonial_record jsonb;
  updated_testimonials jsonb := '[]'::jsonb;
  testimonial_item jsonb;
  fixed_before_url text;
  fixed_after_url text;
  base_url text := 'https://ogpiovfxjxcclptfybrk.supabase.co/storage/v1/object/public/client-photos/';
BEGIN
  -- Loop through all profiles with testimonials
  FOR profile_record IN 
    SELECT id, testimonials 
    FROM profiles 
    WHERE testimonials IS NOT NULL 
      AND jsonb_array_length(testimonials) > 0
  LOOP
    updated_testimonials := '[]'::jsonb;
    
    -- Process each testimonial
    FOR testimonial_record IN 
      SELECT value as testimonial_data
      FROM jsonb_array_elements(profile_record.testimonials)
    LOOP
      testimonial_item := testimonial_record;
      
      -- Fix beforeImage URL if it exists
      IF testimonial_item ? 'beforeImage' AND testimonial_item->>'beforeImage' IS NOT NULL THEN
        fixed_before_url := testimonial_item->>'beforeImage';
        
        -- Extract filename from the URL (remove signed URL parts and fix duplication)
        IF fixed_before_url LIKE '%client-photos/client-photos/%' THEN
          -- Extract just the filename after the duplicated path
          fixed_before_url := regexp_replace(
            fixed_before_url, 
            '.*client-photos/client-photos/([^?]+)(\?.*)?$', 
            base_url || '\1'
          );
          testimonial_item := jsonb_set(testimonial_item, '{beforeImage}', to_jsonb(fixed_before_url));
        ELSIF fixed_before_url LIKE '%/sign/client-photos/%' THEN
          -- Extract filename from signed URL
          fixed_before_url := regexp_replace(
            fixed_before_url, 
            '.*client-photos/([^?]+)(\?.*)?$', 
            base_url || '\1'
          );
          testimonial_item := jsonb_set(testimonial_item, '{beforeImage}', to_jsonb(fixed_before_url));
        END IF;
      END IF;
      
      -- Fix afterImage URL if it exists  
      IF testimonial_item ? 'afterImage' AND testimonial_item->>'afterImage' IS NOT NULL THEN
        fixed_after_url := testimonial_item->>'afterImage';
        
        -- Extract filename from the URL (remove signed URL parts and fix duplication)
        IF fixed_after_url LIKE '%client-photos/client-photos/%' THEN
          -- Extract just the filename after the duplicated path
          fixed_after_url := regexp_replace(
            fixed_after_url, 
            '.*client-photos/client-photos/([^?]+)(\?.*)?$', 
            base_url || '\1'
          );
          testimonial_item := jsonb_set(testimonial_item, '{afterImage}', to_jsonb(fixed_after_url));
        ELSIF fixed_after_url LIKE '%/sign/client-photos/%' THEN
          -- Extract filename from signed URL
          fixed_after_url := regexp_replace(
            fixed_after_url, 
            '.*client-photos/([^?]+)(\?.*)?$', 
            base_url || '\1'
          );
          testimonial_item := jsonb_set(testimonial_item, '{afterImage}', to_jsonb(fixed_after_url));
        END IF;
      END IF;
      
      -- Add fixed testimonial to array
      updated_testimonials := updated_testimonials || testimonial_item;
    END LOOP;
    
    -- Update the profile with fixed URLs
    UPDATE profiles 
    SET 
      testimonials = updated_testimonials,
      updated_at = now()
    WHERE id = profile_record.id;
    
    RAISE NOTICE 'Fixed testimonial URLs for profile: %', profile_record.id;
  END LOOP;
END;
$$;

-- Execute the function to fix existing testimonials
SELECT fix_testimonial_image_urls();

-- Drop the function after use
DROP FUNCTION fix_testimonial_image_urls();