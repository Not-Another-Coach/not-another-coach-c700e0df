-- Create discovery call feedback table
CREATE TABLE public.discovery_call_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discovery_call_id UUID NOT NULL,
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  
  -- Private feedback (client only)
  comfort_level TEXT CHECK (comfort_level IN ('positive', 'neutral', 'negative')),
  would_consider_training TEXT CHECK (would_consider_training IN ('yes', 'maybe', 'no')),
  what_stood_out TEXT,
  comparison_notes TEXT,
  
  -- Coach feedback (shareable anonymously)
  conversation_helpful INTEGER CHECK (conversation_helpful BETWEEN 1 AND 5),
  asked_right_questions INTEGER CHECK (asked_right_questions BETWEEN 1 AND 5),
  professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
  share_with_coach BOOLEAN NOT NULL DEFAULT false,
  coach_notes TEXT,
  
  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  coach_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discovery_call_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can manage their own feedback" 
ON public.discovery_call_feedback 
FOR ALL 
USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view shared feedback" 
ON public.discovery_call_feedback 
FOR SELECT 
USING (auth.uid() = trainer_id AND share_with_coach = true);

-- Create index for faster queries
CREATE INDEX idx_discovery_call_feedback_discovery_call ON public.discovery_call_feedback(discovery_call_id);
CREATE INDEX idx_discovery_call_feedback_client ON public.discovery_call_feedback(client_id);
CREATE INDEX idx_discovery_call_feedback_trainer ON public.discovery_call_feedback(trainer_id);

-- Create notifications table for feedback reminders
CREATE TABLE public.discovery_call_feedback_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discovery_call_id UUID NOT NULL,
  client_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('feedback_reminder', 'feedback_shared')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.discovery_call_feedback_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.discovery_call_feedback_notifications 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "System can manage notifications" 
ON public.discovery_call_feedback_notifications 
FOR ALL 
USING (true);

-- Add updated_at trigger for feedback table
CREATE TRIGGER update_discovery_call_feedback_updated_at
BEFORE UPDATE ON public.discovery_call_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to schedule feedback reminder
CREATE OR REPLACE FUNCTION public.schedule_feedback_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Only schedule if discovery call is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.discovery_call_feedback_notifications (
      discovery_call_id,
      client_id,
      notification_type,
      scheduled_for
    )
    VALUES (
      NEW.id,
      NEW.client_id,
      'feedback_reminder',
      NEW.updated_at + INTERVAL '24 hours'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to schedule feedback reminders when discovery call is completed
CREATE TRIGGER schedule_feedback_reminder_trigger
AFTER UPDATE ON public.discovery_calls
FOR EACH ROW
EXECUTE FUNCTION public.schedule_feedback_reminder();