-- Create Instagram connections table for storing trainer Instagram account info
CREATE TABLE public.instagram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  instagram_username TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Will be encrypted
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'creator')),
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reveal_handle_post_discovery BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one active connection per trainer
  CONSTRAINT unique_active_trainer_connection UNIQUE (trainer_id, is_active) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Create index for faster lookups
CREATE INDEX idx_instagram_connections_trainer_id ON public.instagram_connections(trainer_id);
CREATE INDEX idx_instagram_connections_instagram_user_id ON public.instagram_connections(instagram_user_id);

-- Enable RLS
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instagram_connections
CREATE POLICY "Trainers can manage their own Instagram connections"
  ON public.instagram_connections
  FOR ALL
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

-- Create Instagram selected media table
CREATE TABLE public.instagram_selected_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.instagram_connections(id) ON DELETE CASCADE,
  instagram_media_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT, -- For videos
  caption TEXT,
  permalink TEXT NOT NULL, -- Link to original Instagram post
  display_order INTEGER NOT NULL DEFAULT 0,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique media selection per trainer
  CONSTRAINT unique_trainer_media UNIQUE (trainer_id, instagram_media_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_instagram_selected_media_trainer_id ON public.instagram_selected_media(trainer_id);
CREATE INDEX idx_instagram_selected_media_connection_id ON public.instagram_selected_media(connection_id);
CREATE INDEX idx_instagram_selected_media_display_order ON public.instagram_selected_media(trainer_id, display_order);

-- Enable RLS
ALTER TABLE public.instagram_selected_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instagram_selected_media
CREATE POLICY "Trainers can manage their own selected media"
  ON public.instagram_selected_media
  FOR ALL
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Clients can view selected media for browsing trainers"
  ON public.instagram_selected_media
  FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = trainer_id 
      AND p.user_type = 'trainer'
      AND p.profile_published = true
    )
  );

-- Create discovery call completion tracking for handle revelation
CREATE TABLE public.instagram_handle_revelations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.instagram_connections(id) ON DELETE CASCADE,
  revealed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  discovery_call_id UUID, -- Optional reference to specific discovery call
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique revelation per trainer-client pair
  CONSTRAINT unique_trainer_client_revelation UNIQUE (trainer_id, client_id)
);

-- Create index
CREATE INDEX idx_instagram_handle_revelations_trainer_client ON public.instagram_handle_revelations(trainer_id, client_id);

-- Enable RLS
ALTER TABLE public.instagram_handle_revelations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instagram_handle_revelations
CREATE POLICY "Trainers and clients can view their own revelations"
  ON public.instagram_handle_revelations
  FOR SELECT
  USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "System can create revelations"
  ON public.instagram_handle_revelations
  FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger for instagram_connections
CREATE TRIGGER set_updated_at_instagram_connections
  BEFORE UPDATE ON public.instagram_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Add updated_at trigger for instagram_selected_media  
CREATE TRIGGER set_updated_at_instagram_selected_media
  BEFORE UPDATE ON public.instagram_selected_media
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create function to handle Instagram handle revelation after discovery call completion
CREATE OR REPLACE FUNCTION public.handle_instagram_revelation_on_discovery_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a discovery call is completed, check if trainer has Instagram connection with revelation enabled
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.instagram_handle_revelations (
      trainer_id,
      client_id, 
      connection_id,
      discovery_call_id
    )
    SELECT 
      NEW.trainer_id,
      NEW.client_id,
      ic.id,
      NEW.id
    FROM public.instagram_connections ic
    WHERE ic.trainer_id = NEW.trainer_id 
      AND ic.is_active = true
      AND ic.reveal_handle_post_discovery = true
    ON CONFLICT (trainer_id, client_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on discovery_calls table (assuming it exists)
-- Note: This will only work if discovery_calls table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discovery_calls' AND table_schema = 'public') THEN
    CREATE TRIGGER instagram_revelation_on_discovery_completion
      AFTER UPDATE ON public.discovery_calls
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_instagram_revelation_on_discovery_completion();
  END IF;
END $$;