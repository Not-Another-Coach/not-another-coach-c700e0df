-- Create enum for waitlist status
CREATE TYPE public.waitlist_status AS ENUM ('active', 'contacted', 'converted', 'archived');

-- Create enum for coach availability status  
CREATE TYPE public.coach_availability_status AS ENUM ('accepting', 'waitlist', 'unavailable');

-- Create waitlist table
CREATE TABLE public.coach_waitlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  status waitlist_status NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_start_date DATE,
  follow_up_scheduled_date DATE,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  coach_notes TEXT,
  client_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, coach_id)
);

-- Create coach availability settings table
CREATE TABLE public.coach_availability_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL UNIQUE,
  availability_status coach_availability_status NOT NULL DEFAULT 'accepting',
  next_available_date DATE,
  allow_discovery_calls_on_waitlist BOOLEAN NOT NULL DEFAULT true,
  auto_follow_up_days INTEGER NOT NULL DEFAULT 14,
  waitlist_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waitlist interactions table for tracking communications
CREATE TABLE public.waitlist_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_id UUID NOT NULL REFERENCES public.coach_waitlists(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'auto_scheduled', 'coach_message', 'client_response', 'slot_offered'
  message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coach_waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_waitlists
CREATE POLICY "Clients can view their own waitlist entries" 
ON public.coach_waitlists 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Coaches can view their own waitlist" 
ON public.coach_waitlists 
FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Clients can create their own waitlist entries" 
ON public.coach_waitlists 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Coaches can update their waitlist entries" 
ON public.coach_waitlists 
FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Admins can manage all waitlists" 
ON public.coach_waitlists 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for coach_availability_settings
CREATE POLICY "Coaches can manage their own availability" 
ON public.coach_availability_settings 
FOR ALL 
USING (auth.uid() = coach_id);

CREATE POLICY "Users can view coach availability" 
ON public.coach_availability_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all availability settings" 
ON public.coach_availability_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for waitlist_interactions
CREATE POLICY "Users can view interactions for their waitlists" 
ON public.waitlist_interactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.coach_waitlists 
    WHERE id = waitlist_interactions.waitlist_id 
    AND (client_id = auth.uid() OR coach_id = auth.uid())
  )
);

CREATE POLICY "Coaches can create interactions for their waitlists" 
ON public.waitlist_interactions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coach_waitlists 
    WHERE id = waitlist_interactions.waitlist_id 
    AND coach_id = auth.uid()
  )
);

CREATE POLICY "System can create automated interactions" 
ON public.waitlist_interactions 
FOR INSERT 
WITH CHECK (interaction_type = 'auto_scheduled');

-- Create indexes for performance
CREATE INDEX idx_coach_waitlists_coach_id ON public.coach_waitlists(coach_id);
CREATE INDEX idx_coach_waitlists_client_id ON public.coach_waitlists(client_id);
CREATE INDEX idx_coach_waitlists_status ON public.coach_waitlists(status);
CREATE INDEX idx_waitlist_interactions_waitlist_id ON public.waitlist_interactions(waitlist_id);
CREATE INDEX idx_waitlist_interactions_scheduled_for ON public.waitlist_interactions(scheduled_for);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_coach_waitlists_updated_at
BEFORE UPDATE ON public.coach_waitlists
FOR EACH ROW
EXECUTE FUNCTION public.update_waitlist_updated_at();

CREATE TRIGGER update_coach_availability_settings_updated_at
BEFORE UPDATE ON public.coach_availability_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_waitlist_updated_at();

-- Create function to schedule follow-ups
CREATE OR REPLACE FUNCTION public.schedule_waitlist_follow_up()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule follow-up interaction when someone joins waitlist
  IF TG_OP = 'INSERT' AND NEW.estimated_start_date IS NOT NULL THEN
    INSERT INTO public.waitlist_interactions (
      waitlist_id,
      interaction_type,
      message,
      scheduled_for
    )
    SELECT 
      NEW.id,
      'auto_scheduled',
      'Automated follow-up reminder for coach',
      NEW.estimated_start_date - INTERVAL '14 days'
    WHERE NEW.estimated_start_date > CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic follow-up scheduling
CREATE TRIGGER schedule_waitlist_follow_up_trigger
AFTER INSERT ON public.coach_waitlists
FOR EACH ROW
EXECUTE FUNCTION public.schedule_waitlist_follow_up();