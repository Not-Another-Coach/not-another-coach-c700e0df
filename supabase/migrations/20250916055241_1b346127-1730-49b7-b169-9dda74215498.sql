-- Create anonymous sessions table for cross-device data persistence
CREATE TABLE public.anonymous_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  saved_trainers JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz_results JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on session_id for fast lookups
CREATE INDEX idx_anonymous_sessions_session_id ON public.anonymous_sessions(session_id);

-- Create index on expires_at for cleanup queries
CREATE INDEX idx_anonymous_sessions_expires_at ON public.anonymous_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous sessions
-- Anyone can create anonymous sessions
CREATE POLICY "Anyone can create anonymous sessions" 
ON public.anonymous_sessions 
FOR INSERT 
WITH CHECK (true);

-- Anyone can view/update/delete sessions they know the session_id for
-- The session_id acts as the access token for anonymous users
CREATE POLICY "Access sessions by session_id" 
ON public.anonymous_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_anonymous_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_anonymous_sessions_updated_at
BEFORE UPDATE ON public.anonymous_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_anonymous_sessions_updated_at();

-- Create function to clean up expired anonymous sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.anonymous_sessions 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;