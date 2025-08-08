-- Seed default system-wide activities for Ways of Working suggestions
WITH defaults(activity_name, category) AS (
  VALUES
    -- Onboarding
    ('Free 15-min discovery call','Onboarding'),
    ('Comprehensive health questionnaire','Onboarding'),
    ('Goals & lifestyle assessment','Onboarding'),
    ('Starting photos & measurements','Onboarding'),
    ('Movement assessment session','Onboarding'),
    ('Nutrition preferences discussion','Onboarding'),

    -- First Week
    ('Welcome package sent via app','First Week'),
    ('Personalized training plan delivered by Day 2','First Week'),
    ('First live session scheduled','First Week'),
    ('Nutrition guidelines provided','First Week'),
    ('Check-in call within 48 hours','First Week'),
    ('App setup & walkthrough','First Week'),

    -- Ongoing Structure
    ('Weekly video check-ins','Ongoing Structure'),
    ('Bi-weekly live sessions','Ongoing Structure'),
    ('Monthly goal reviews','Ongoing Structure'),
    ('Daily messaging support Mon-Fri','Ongoing Structure'),
    ('Flexible session rescheduling','Ongoing Structure'),
    ('Quarterly progress assessments','Ongoing Structure'),

    -- Tracking Tools
    ('Before/after photos','Tracking Tools'),
    ('Body measurements tracking','Tracking Tools'),
    ('Food journal reviews','Tracking Tools'),
    ('Workout completion logs','Tracking Tools'),
    ('Progress photos monthly','Tracking Tools'),
    ('Performance metrics tracking','Tracking Tools'),

    -- Client Expectations
    ('Weekly honest feedback','Client Expectations'),
    ('Consistent communication','Client Expectations'),
    ('Openness to try new routines','Client Expectations'),
    ('Photo/measurement updates','Client Expectations'),
    ('Active participation in sessions','Client Expectations'),
    ('Regular check-in responses','Client Expectations'),

    -- What I Bring
    ('Personalized training programs','What I Bring'),
    ('Ongoing motivation & support','What I Bring'),
    ('Flexible scheduling options','What I Bring'),
    ('Evidence-based approaches','What I Bring'),
    ('Adaptation to your lifestyle','What I Bring'),
    ('Realistic goal setting','What I Bring')
)
INSERT INTO public.trainer_onboarding_activities (activity_name, category, is_system)
SELECT d.activity_name, d.category, true
FROM defaults d
LEFT JOIN public.trainer_onboarding_activities t
  ON t.is_system = true AND t.activity_name = d.activity_name
WHERE t.activity_name IS NULL;