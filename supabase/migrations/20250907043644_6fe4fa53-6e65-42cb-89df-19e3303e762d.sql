-- =============================================
-- PERFORMANCE OPTIMIZATION FOR RLS POLICIES - PART 2 (Fixed)
-- Add performance indexes and optimize key RLS policies
-- =============================================

-- Add indexes for performance (without CONCURRENTLY since we're in a transaction)
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type) WHERE user_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_trainer ON public.onboarding_templates(trainer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(client_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_target_audience ON public.alerts USING GIN(target_audience) WHERE is_active = true;

-- Optimize key RLS policies that cause performance issues
-- Replace complex EXISTS subqueries with optimized security definer functions

-- Fix onboarding_commitments policy
DROP POLICY IF EXISTS "Trainers can manage their commitment templates" ON public.onboarding_commitments;
CREATE POLICY "optimized_trainers_manage_commitments" ON public.onboarding_commitments
FOR ALL
USING (public.user_owns_template(template_id))
WITH CHECK (public.user_owns_template(template_id));

-- Fix onboarding_activity_assignments policy  
DROP POLICY IF EXISTS "Trainers can manage their activity assignments" ON public.onboarding_activity_assignments;
CREATE POLICY "optimized_trainers_manage_activity_assignments" ON public.onboarding_activity_assignments
FOR ALL
USING (public.user_owns_template(template_id))
WITH CHECK (public.user_owns_template(template_id));

-- Fix onboarding_conditional_evaluations policy
DROP POLICY IF EXISTS "Trainers can view client evaluations" ON public.onboarding_conditional_evaluations;
CREATE POLICY "optimized_trainers_view_evaluations" ON public.onboarding_conditional_evaluations
FOR SELECT
USING (public.user_owns_template(template_id));

-- Fix goal_client_links policy
DROP POLICY IF EXISTS "Trainers can manage their goal-client links" ON public.goal_client_links;
CREATE POLICY "optimized_trainers_manage_goal_links" ON public.goal_client_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM goals g 
    WHERE g.id = goal_client_links.goal_id 
    AND g.trainer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM goals g 
    WHERE g.id = goal_client_links.goal_id 
    AND g.trainer_id = auth.uid()
  )
);