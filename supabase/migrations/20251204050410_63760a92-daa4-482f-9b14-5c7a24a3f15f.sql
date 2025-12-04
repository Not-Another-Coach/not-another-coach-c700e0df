-- Create combined update function using SECURITY INVOKER (respects RLS)
CREATE OR REPLACE FUNCTION update_client_profile_combined(
  p_profile_data JSONB DEFAULT '{}'::jsonb,
  p_client_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user from auth context (SECURITY INVOKER uses caller's permissions)
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Update profiles table if data provided
  IF p_profile_data IS NOT NULL AND p_profile_data != '{}'::jsonb THEN
    UPDATE profiles 
    SET 
      first_name = CASE WHEN p_profile_data ? 'first_name' THEN p_profile_data->>'first_name' ELSE first_name END,
      last_name = CASE WHEN p_profile_data ? 'last_name' THEN p_profile_data->>'last_name' ELSE last_name END,
      profile_photo_url = CASE WHEN p_profile_data ? 'profile_photo_url' THEN p_profile_data->>'profile_photo_url' ELSE profile_photo_url END,
      location = CASE WHEN p_profile_data ? 'location' THEN p_profile_data->>'location' ELSE location END,
      gender_preference = CASE WHEN p_profile_data ? 'gender_preference' THEN p_profile_data->>'gender_preference' ELSE gender_preference END,
      timezone = CASE WHEN p_profile_data ? 'timezone' THEN p_profile_data->>'timezone' ELSE timezone END,
      phone_number = CASE WHEN p_profile_data ? 'phone_number' THEN p_profile_data->>'phone_number' ELSE phone_number END,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Upsert client_profiles table if data provided
  IF p_client_data IS NOT NULL AND p_client_data != '{}'::jsonb THEN
    INSERT INTO client_profiles (id, updated_at)
    VALUES (v_user_id, now())
    ON CONFLICT (id) DO NOTHING;
    
    -- Now update with the provided fields
    UPDATE client_profiles SET
      primary_goals = CASE WHEN p_client_data ? 'primary_goals' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_client_data->'primary_goals') x) ELSE primary_goals END,
      secondary_goals = CASE WHEN p_client_data ? 'secondary_goals' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_client_data->'secondary_goals') x) ELSE secondary_goals END,
      fitness_goals = CASE WHEN p_client_data ? 'fitness_goals' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_client_data->'fitness_goals') x) ELSE fitness_goals END,
      experience_level = CASE WHEN p_client_data ? 'experience_level' THEN p_client_data->>'experience_level' ELSE experience_level END,
      preferred_training_frequency = CASE WHEN p_client_data ? 'preferred_training_frequency' THEN p_client_data->>'preferred_training_frequency' ELSE preferred_training_frequency END,
      preferred_time_slots = CASE WHEN p_client_data ? 'preferred_time_slots' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_client_data->'preferred_time_slots') x) ELSE preferred_time_slots END,
      start_timeline = CASE WHEN p_client_data ? 'start_timeline' THEN p_client_data->>'start_timeline' ELSE start_timeline END,
      preferred_coaching_style = CASE WHEN p_client_data ? 'preferred_coaching_style' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_client_data->'preferred_coaching_style') x) ELSE preferred_coaching_style END,
      motivation_factors = CASE WHEN p_client_data ? 'motivation_factors' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_client_data->'motivation_factors') x) ELSE motivation_factors END,
      client_personality_type = CASE WHEN p_client_data ? 'client_personality_type' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_client_data->'client_personality_type') x) ELSE client_personality_type END,
      training_location_preference = CASE WHEN p_client_data ? 'training_location_preference' THEN p_client_data->>'training_location_preference' ELSE training_location_preference END,
      open_to_virtual_coaching = CASE WHEN p_client_data ? 'open_to_virtual_coaching' THEN (p_client_data->>'open_to_virtual_coaching')::boolean ELSE open_to_virtual_coaching END,
      budget_range_min = CASE WHEN p_client_data ? 'budget_range_min' THEN (p_client_data->>'budget_range_min')::numeric ELSE budget_range_min END,
      budget_range_max = CASE WHEN p_client_data ? 'budget_range_max' THEN (p_client_data->>'budget_range_max')::numeric ELSE budget_range_max END,
      budget_flexibility = CASE WHEN p_client_data ? 'budget_flexibility' THEN p_client_data->>'budget_flexibility' ELSE budget_flexibility END,
      waitlist_preference = CASE WHEN p_client_data ? 'waitlist_preference' THEN (p_client_data->>'waitlist_preference')::boolean ELSE waitlist_preference END,
      flexible_scheduling = CASE WHEN p_client_data ? 'flexible_scheduling' THEN (p_client_data->>'flexible_scheduling')::boolean ELSE flexible_scheduling END,
      preferred_package_type = CASE WHEN p_client_data ? 'preferred_package_type' THEN p_client_data->>'preferred_package_type' ELSE preferred_package_type END,
      client_survey_completed = CASE WHEN p_client_data ? 'client_survey_completed' THEN (p_client_data->>'client_survey_completed')::boolean ELSE client_survey_completed END,
      client_survey_completed_at = CASE 
        WHEN p_client_data ? 'client_survey_completed' AND (p_client_data->>'client_survey_completed')::boolean = true AND client_survey_completed_at IS NULL 
        THEN now() 
        ELSE client_survey_completed_at 
      END,
      fitness_equipment_access = CASE WHEN p_client_data ? 'fitness_equipment_access' THEN p_client_data->'fitness_equipment_access' ELSE fitness_equipment_access END,
      lifestyle_description = CASE WHEN p_client_data ? 'lifestyle_description' THEN p_client_data->'lifestyle_description' ELSE lifestyle_description END,
      lifestyle_other = CASE WHEN p_client_data ? 'lifestyle_other' THEN p_client_data->>'lifestyle_other' ELSE lifestyle_other END,
      health_conditions = CASE WHEN p_client_data ? 'health_conditions' THEN p_client_data->>'health_conditions' ELSE health_conditions END,
      has_specific_event = CASE WHEN p_client_data ? 'has_specific_event' THEN p_client_data->>'has_specific_event' ELSE has_specific_event END,
      specific_event_details = CASE WHEN p_client_data ? 'specific_event_details' THEN p_client_data->>'specific_event_details' ELSE specific_event_details END,
      specific_event_date = CASE WHEN p_client_data ? 'specific_event_date' AND p_client_data->>'specific_event_date' IS NOT NULL AND p_client_data->>'specific_event_date' != '' THEN (p_client_data->>'specific_event_date')::date ELSE specific_event_date END,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;
END;
$$;