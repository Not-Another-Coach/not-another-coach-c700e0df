-- Create combined RPC function for trainer profile updates
-- This reduces 2 API calls to 1 and respects RLS via SECURITY INVOKER

CREATE OR REPLACE FUNCTION public.update_trainer_profile_combined(
  p_profile_data JSONB DEFAULT '{}'::jsonb,
  p_trainer_data JSONB DEFAULT '{}'::jsonb
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
      timezone = CASE WHEN p_profile_data ? 'timezone' THEN p_profile_data->>'timezone' ELSE timezone END,
      phone_number = CASE WHEN p_profile_data ? 'phone_number' THEN p_profile_data->>'phone_number' ELSE phone_number END,
      tagline = CASE WHEN p_profile_data ? 'tagline' THEN p_profile_data->>'tagline' ELSE tagline END,
      bio = CASE WHEN p_profile_data ? 'bio' THEN p_profile_data->>'bio' ELSE bio END,
      profile_image_position = CASE WHEN p_profile_data ? 'profile_image_position' THEN p_profile_data->'profile_image_position' ELSE profile_image_position END,
      terms_agreed = CASE WHEN p_profile_data ? 'terms_agreed' THEN (p_profile_data->>'terms_agreed')::boolean ELSE terms_agreed END,
      accuracy_confirmed = CASE WHEN p_profile_data ? 'accuracy_confirmed' THEN (p_profile_data->>'accuracy_confirmed')::boolean ELSE accuracy_confirmed END,
      notify_profile_views = CASE WHEN p_profile_data ? 'notify_profile_views' THEN (p_profile_data->>'notify_profile_views')::boolean ELSE notify_profile_views END,
      notify_messages = CASE WHEN p_profile_data ? 'notify_messages' THEN (p_profile_data->>'notify_messages')::boolean ELSE notify_messages END,
      notify_insights = CASE WHEN p_profile_data ? 'notify_insights' THEN (p_profile_data->>'notify_insights')::boolean ELSE notify_insights END,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Upsert trainer_profiles table if data provided
  IF p_trainer_data IS NOT NULL AND p_trainer_data != '{}'::jsonb THEN
    -- Ensure trainer_profiles row exists
    INSERT INTO trainer_profiles (id, updated_at)
    VALUES (v_user_id, now())
    ON CONFLICT (id) DO NOTHING;
    
    -- Now update with the provided fields
    UPDATE trainer_profiles SET
      hourly_rate = CASE WHEN p_trainer_data ? 'hourly_rate' AND p_trainer_data->>'hourly_rate' IS NOT NULL THEN (p_trainer_data->>'hourly_rate')::numeric ELSE hourly_rate END,
      free_discovery_call = CASE WHEN p_trainer_data ? 'free_discovery_call' THEN (p_trainer_data->>'free_discovery_call')::boolean ELSE free_discovery_call END,
      calendar_link = CASE WHEN p_trainer_data ? 'calendar_link' THEN p_trainer_data->>'calendar_link' ELSE calendar_link END,
      profile_setup_completed = CASE WHEN p_trainer_data ? 'profile_setup_completed' THEN (p_trainer_data->>'profile_setup_completed')::boolean ELSE profile_setup_completed END,
      max_clients = CASE WHEN p_trainer_data ? 'max_clients' AND p_trainer_data->>'max_clients' IS NOT NULL THEN (p_trainer_data->>'max_clients')::integer ELSE max_clients END,
      qualifications = CASE WHEN p_trainer_data ? 'qualifications' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_trainer_data->'qualifications') x) ELSE qualifications END,
      specializations = CASE WHEN p_trainer_data ? 'specializations' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_trainer_data->'specializations') x) ELSE specializations END,
      training_types = CASE WHEN p_trainer_data ? 'training_types' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_trainer_data->'training_types') x) ELSE training_types END,
      delivery_format = CASE WHEN p_trainer_data ? 'delivery_format' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_trainer_data->'delivery_format') x) ELSE delivery_format END,
      ideal_client_types = CASE WHEN p_trainer_data ? 'ideal_client_types' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_trainer_data->'ideal_client_types') x) ELSE ideal_client_types END,
      coaching_style = CASE WHEN p_trainer_data ? 'coaching_style' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_trainer_data->'coaching_style') x) ELSE coaching_style END,
      communication_style = CASE WHEN p_trainer_data ? 'communication_style' THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(p_trainer_data->'communication_style') x) ELSE communication_style END,
      ideal_client_personality = CASE WHEN p_trainer_data ? 'ideal_client_personality' THEN p_trainer_data->>'ideal_client_personality' ELSE ideal_client_personality END,
      package_options = CASE WHEN p_trainer_data ? 'package_options' THEN p_trainer_data->'package_options' ELSE package_options END,
      video_checkins = CASE WHEN p_trainer_data ? 'video_checkins' THEN (p_trainer_data->>'video_checkins')::boolean ELSE video_checkins END,
      messaging_support = CASE WHEN p_trainer_data ? 'messaging_support' THEN (p_trainer_data->>'messaging_support')::boolean ELSE messaging_support END,
      weekly_programming_only = CASE WHEN p_trainer_data ? 'weekly_programming_only' THEN (p_trainer_data->>'weekly_programming_only')::boolean ELSE weekly_programming_only END,
      how_started = CASE WHEN p_trainer_data ? 'how_started' THEN p_trainer_data->>'how_started' ELSE how_started END,
      philosophy = CASE WHEN p_trainer_data ? 'philosophy' THEN p_trainer_data->>'philosophy' ELSE philosophy END,
      professional_milestones = CASE WHEN p_trainer_data ? 'professional_milestones' THEN p_trainer_data->'professional_milestones' ELSE professional_milestones END,
      uploaded_certificates = CASE WHEN p_trainer_data ? 'uploaded_certificates' THEN p_trainer_data->'uploaded_certificates' ELSE uploaded_certificates END,
      testimonials = CASE WHEN p_trainer_data ? 'testimonials' THEN p_trainer_data->'testimonials' ELSE testimonials END,
      training_type_delivery = CASE WHEN p_trainer_data ? 'training_type_delivery' THEN p_trainer_data->'training_type_delivery' ELSE training_type_delivery END,
      document_not_applicable = CASE WHEN p_trainer_data ? 'document_not_applicable' THEN p_trainer_data->'document_not_applicable' ELSE document_not_applicable END,
      wow_how_i_work = CASE WHEN p_trainer_data ? 'wow_how_i_work' THEN p_trainer_data->>'wow_how_i_work' ELSE wow_how_i_work END,
      wow_what_i_provide = CASE WHEN p_trainer_data ? 'wow_what_i_provide' THEN p_trainer_data->>'wow_what_i_provide' ELSE wow_what_i_provide END,
      wow_client_expectations = CASE WHEN p_trainer_data ? 'wow_client_expectations' THEN p_trainer_data->>'wow_client_expectations' ELSE wow_client_expectations END,
      wow_activities = CASE WHEN p_trainer_data ? 'wow_activities' THEN p_trainer_data->'wow_activities' ELSE wow_activities END,
      wow_activity_assignments = CASE WHEN p_trainer_data ? 'wow_activity_assignments' THEN p_trainer_data->'wow_activity_assignments' ELSE wow_activity_assignments END,
      wow_visibility = CASE WHEN p_trainer_data ? 'wow_visibility' THEN p_trainer_data->>'wow_visibility' ELSE wow_visibility END,
      wow_setup_completed = CASE WHEN p_trainer_data ? 'wow_setup_completed' THEN (p_trainer_data->>'wow_setup_completed')::boolean ELSE wow_setup_completed END,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;
END;
$$;