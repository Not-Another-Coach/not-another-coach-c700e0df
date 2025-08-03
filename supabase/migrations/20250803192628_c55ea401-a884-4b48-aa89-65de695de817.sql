-- Create alerts table for News & Alerts system
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('coach_update', 'platform_nudge', 'system_alert', 'achievement', 'availability')),
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  target_audience JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_alert_interactions table to track read/dismissed alerts
CREATE TABLE public.user_alert_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'dismissed', 'clicked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, alert_id, interaction_type)
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts
CREATE POLICY "Users can view active alerts" 
ON public.alerts 
FOR SELECT 
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND (
    target_audience = '{}' 
    OR target_audience ? 'all'
    OR (target_audience ? 'clients' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'client'
    ))
  )
);

CREATE POLICY "Admins can manage alerts" 
ON public.alerts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Coaches can create their own updates" 
ON public.alerts 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND alert_type = 'coach_update'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'trainer'
  )
);

-- RLS Policies for user_alert_interactions
CREATE POLICY "Users can manage their own interactions" 
ON public.user_alert_interactions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_alerts_active_expires ON public.alerts (is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_alerts_type_priority ON public.alerts (alert_type, priority);
CREATE INDEX idx_user_interactions_user_alert ON public.user_alert_interactions (user_id, alert_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_alerts_updated_at();