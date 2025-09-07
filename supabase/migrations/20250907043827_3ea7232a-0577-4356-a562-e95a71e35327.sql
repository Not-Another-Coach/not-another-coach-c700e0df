-- =============================================
-- PERFORMANCE OPTIMIZATION FOR RLS POLICIES - FINAL
-- Add performance indexes and update existing policies
-- =============================================

-- Add indexes for performance (these are critical for RLS performance)
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type) WHERE user_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_trainer ON public.onboarding_templates(trainer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(client_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_target_audience ON public.alerts USING GIN(target_audience) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_trainer ON public.client_onboarding_progress(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_client ON public.client_onboarding_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_discovery_calls_participants ON public.discovery_calls(client_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_coach_waitlists_participants ON public.coach_waitlists(client_id, coach_id);

-- Update the useUserRoles hook to use the optimized function
-- This will be done in the frontend code next