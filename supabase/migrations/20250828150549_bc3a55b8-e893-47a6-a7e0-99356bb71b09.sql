-- Add new activity type support to trainer_onboarding_activities table
ALTER TABLE trainer_onboarding_activities 
ADD COLUMN activity_type text DEFAULT 'task' CHECK (activity_type IN ('task', 'appointment', 'survey', 'training_content', 'file_upload')),
ADD COLUMN appointment_config jsonb DEFAULT '{}',
ADD COLUMN survey_config jsonb DEFAULT '{}', 
ADD COLUMN content_config jsonb DEFAULT '{}',
ADD COLUMN upload_config jsonb DEFAULT '{}';

-- Create activity appointments table
CREATE TABLE activity_appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid REFERENCES trainer_onboarding_activities(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  meeting_link text,
  calendar_event_id text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  client_notes text,
  trainer_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create activity completions table for enhanced tracking
CREATE TABLE activity_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid REFERENCES trainer_onboarding_activities(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  template_assignment_id uuid REFERENCES client_template_assignments(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  completion_data jsonb DEFAULT '{}',
  completed_at timestamp with time zone,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  due_at timestamp with time zone,
  sla_due_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE activity_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_appointments
CREATE POLICY "Users can view their own appointments" ON activity_appointments
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Trainers can manage their appointments" ON activity_appointments
  FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can view and update their appointments" ON activity_appointments
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can update their appointment notes" ON activity_appointments
  FOR UPDATE USING (auth.uid() = client_id);

-- RLS policies for activity_completions  
CREATE POLICY "Users can view their own activity completions" ON activity_completions
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Trainers can manage their client completions" ON activity_completions
  FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can update their own completions" ON activity_completions
  FOR UPDATE USING (auth.uid() = client_id);

-- Add indexes for performance
CREATE INDEX idx_activity_appointments_client_trainer ON activity_appointments(client_id, trainer_id);
CREATE INDEX idx_activity_appointments_scheduled_at ON activity_appointments(scheduled_at);
CREATE INDEX idx_activity_completions_client_trainer ON activity_completions(client_id, trainer_id);
CREATE INDEX idx_activity_completions_status ON activity_completions(status);