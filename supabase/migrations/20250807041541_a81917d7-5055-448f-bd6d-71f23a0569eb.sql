-- Fix security warnings by setting search_path for knowledge base functions

CREATE OR REPLACE FUNCTION public.update_kb_article_search_vector()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '') || ' ' || 
    COALESCE(NEW.excerpt, '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_kb_article_revision()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_revision_number INTEGER;
BEGIN
  -- Only create revision on content changes, not just view count updates
  IF TG_OP = 'UPDATE' AND (
    OLD.title IS DISTINCT FROM NEW.title OR 
    OLD.content IS DISTINCT FROM NEW.content OR 
    OLD.excerpt IS DISTINCT FROM NEW.excerpt
  ) THEN
    -- Get next revision number
    SELECT COALESCE(MAX(revision_number), 0) + 1 
    INTO next_revision_number 
    FROM public.kb_article_revisions 
    WHERE article_id = NEW.id;
    
    -- Create revision record
    INSERT INTO public.kb_article_revisions (
      article_id, revision_number, title, content, excerpt, 
      metadata, created_by
    ) VALUES (
      NEW.id, next_revision_number, NEW.title, NEW.content, NEW.excerpt,
      NEW.metadata, NEW.updated_by
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_kb_tag_usage_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.kb_tags 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.kb_tags 
    SET usage_count = GREATEST(usage_count - 1, 0) 
    WHERE id = OLD.tag_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;