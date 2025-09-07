-- =============================================
-- PERFORMANCE OPTIMIZATION FOR RLS POLICIES - PART 2
-- Add performance indexes and optimize key RLS policies
-- =============================================

-- Add indexes for performance (without CONCURRENTLY since we're in a transaction)
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type) WHERE user_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_trainer ON public.onboarding_templates(trainer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(client_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_target_audience ON public.alerts USING GIN(target_audience) WHERE is_active = true;

-- Now optimize the most performance-critical RLS policies
-- Start with alerts table which has complex JSON operations

-- Drop existing inefficient policies
DROP POLICY IF EXISTS "Users can view alerts for their audience" ON public.alerts;
DROP POLICY IF EXISTS "Users can see relevant alerts" ON public.alerts;

-- Create optimized policy using the new function
CREATE POLICY "optimized_users_can_view_alerts" ON public.alerts
FOR SELECT 
USING (
  is_active = true 
  AND public.user_in_target_audience(target_audience)
);

-- Optimize onboarding_templates policies
DROP POLICY IF EXISTS "Trainers can manage their own templates" ON public.onboarding_templates;

CREATE POLICY "optimized_trainers_manage_templates" ON public.onboarding_templates
FOR ALL
USING (public.get_current_user_type() = 'trainer' AND trainer_id = auth.uid())
WITH CHECK (public.get_current_user_type() = 'trainer' AND trainer_id = auth.uid());

-- Optimize client_onboarding_progress policies
DROP POLICY IF EXISTS "Trainers can manage their clients' progress" ON public.client_onboarding_progress;

CREATE POLICY "optimized_trainers_manage_client_progress" ON public.client_onboarding_progress
FOR ALL
USING (public.get_current_user_type() = 'trainer' AND trainer_id = auth.uid())
WITH CHECK (public.get_current_user_type() = 'trainer' AND trainer_id = auth.uid());