-- Create enum for discovery call status
CREATE TYPE discovery_call_status AS ENUM (
  'scheduled',
  'completed', 
  'cancelled',
  'rescheduled'
);

-- Create trainer availability settings table
CREATE TABLE public.trainer_availability_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offers_discovery_call BOOLEAN NOT NULL DEFAULT false,
  discovery_call_duration INTEGER NOT NULL DEFAULT 15,
  availability_schedule JSONB NOT NULL DEFAULT '{
    "monday": {"enabled": false, "slots": []},
    "tuesday": {"enabled": false, "slots": []}, 
    "wednesday": {"enabled": false, "slots": []},
    "thursday": {"enabled": false, "slots": []},
    "friday": {"enabled": false, "slots": []},
    "saturday": {"enabled": false, "slots": []},
    "sunday": {"enabled": false, "slots": []}
  }'::jsonb,
  prep_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Create discovery calls table
CREATE TABLE public.discovery_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  status discovery_call_status NOT NULL DEFAULT 'scheduled',
  prep_notes TEXT,
  cancellation_reason TEXT,
  calendar_event_id TEXT,
  booking_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.trainer_availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies for trainer_availability_settings
CREATE POLICY "Trainers can manage their own availability settings"
ON public.trainer_availability_settings
FOR ALL
USING (auth.uid() = trainer_id);

CREATE POLICY "Users can view trainer availability settings"
ON public.trainer_availability_settings
FOR SELECT
USING (true);

-- RLS policies for discovery_calls  
CREATE POLICY "Clients can create discovery calls"
ON public.discovery_calls
FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view their own discovery calls"
ON public.discovery_calls
FOR SELECT
USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "Users can update their own discovery calls"
ON public.discovery_calls
FOR UPDATE
USING (auth.uid() = trainer_id OR auth.uid() = client_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_trainer_availability_settings_updated_at
BEFORE UPDATE ON public.trainer_availability_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discovery_calls_updated_at
BEFORE UPDATE ON public.discovery_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_trainer_availability_settings_trainer_id ON public.trainer_availability_settings(trainer_id);
CREATE INDEX idx_discovery_calls_trainer_id ON public.discovery_calls(trainer_id);
CREATE INDEX idx_discovery_calls_client_id ON public.discovery_calls(client_id);
CREATE INDEX idx_discovery_calls_scheduled_for ON public.discovery_calls(scheduled_for);
CREATE INDEX idx_discovery_calls_status ON public.discovery_calls(status);