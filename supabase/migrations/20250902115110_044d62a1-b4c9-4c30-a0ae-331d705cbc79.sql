-- Security Fix Phase 1: Fix search_path on existing functions
-- This prevents search path manipulation attacks without breaking dependencies

-- Fix existing functions by altering them to add search_path
ALTER FUNCTION public.update_coach_analytics() SET search_path TO 'public';
ALTER FUNCTION public.update_conversation_on_message() SET search_path TO 'public';
ALTER FUNCTION public.set_onboarding_due_dates() SET search_path TO 'public';
ALTER FUNCTION public.update_trainer_profile_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_client_profile_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.enforce_single_active_template() SET search_path TO 'public';
ALTER FUNCTION public.handle_instagram_revelation_on_discovery_completion() SET search_path TO 'public';
ALTER FUNCTION public.create_domain_profile() SET search_path TO 'public';
ALTER FUNCTION public.check_client_survey_completion() SET search_path TO 'public';
ALTER FUNCTION public.list_users_minimal_admin() SET search_path TO 'public';
ALTER FUNCTION public.sync_ways_of_working_to_activities(uuid, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.get_content_visibility(uuid, content_type, engagement_stage) SET search_path TO 'public';
ALTER FUNCTION public.initialize_trainer_visibility_defaults(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_engagement_stage(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.grant_admin_role(uuid) SET search_path TO 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.get_user_roles(uuid) SET search_path TO 'public';
ALTER FUNCTION public.revert_waitlist_client_conversion(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.request_trainer_verification(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.log_admin_action(uuid, text, jsonb, text) SET search_path TO 'public';
ALTER FUNCTION public.suspend_user(uuid, text, integer) SET search_path TO 'public';
ALTER FUNCTION public.reactivate_user(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.update_admin_notes(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.restrict_communication(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.update_kb_article_search_vector() SET search_path TO 'public';
ALTER FUNCTION public.update_waitlist_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.schedule_waitlist_follow_up() SET search_path TO 'public';
ALTER FUNCTION public.start_waitlist_exclusive_period(uuid, integer) SET search_path TO 'public';
ALTER FUNCTION public.create_kb_article_revision() SET search_path TO 'public';
ALTER FUNCTION public.update_kb_tag_usage_count() SET search_path TO 'public';
ALTER FUNCTION public.client_has_sent_first_message(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.create_coach_selection_alert() SET search_path TO 'public';
ALTER FUNCTION public.end_waitlist_exclusive_period(uuid) SET search_path TO 'public';
ALTER FUNCTION public.auto_end_expired_exclusive_periods() SET search_path TO 'public';
ALTER FUNCTION public.client_has_waitlist_exclusive_access(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.import_activities_from_ways_of_working(uuid) SET search_path TO 'public';
ALTER FUNCTION public.lock_template_on_publish() SET search_path TO 'public';
ALTER FUNCTION public.update_client_status() SET search_path TO 'public';
ALTER FUNCTION public.get_user_emails_for_development() SET search_path TO 'public';
ALTER FUNCTION public.get_user_emails_for_admin() SET search_path TO 'public';
ALTER FUNCTION public.update_engagement_stage(uuid, uuid, engagement_stage) SET search_path TO 'public';
ALTER FUNCTION public.set_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_all_user_passwords_dev() SET search_path TO 'public';
ALTER FUNCTION public.is_client_on_waitlist(uuid, uuid) SET search_path TO 'public';