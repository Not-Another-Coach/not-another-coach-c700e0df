-- Create enum types for knowledge base
CREATE TYPE kb_article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE kb_content_type AS ENUM ('feature', 'api', 'component', 'hook', 'database', 'business_rule', 'integration');

-- Create knowledge base categories table
CREATE TABLE public.kb_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.kb_categories(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create knowledge base articles table
CREATE TABLE public.kb_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  content_type kb_content_type NOT NULL,
  status kb_article_status NOT NULL DEFAULT 'draft',
  category_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  search_vector tsvector,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create knowledge base article revisions table for version history
CREATE TABLE public.kb_article_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(article_id, revision_number)
);

-- Create knowledge base tags table
CREATE TABLE public.kb_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create many-to-many relationship between articles and tags
CREATE TABLE public.kb_article_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.kb_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX idx_kb_articles_status ON public.kb_articles(status);
CREATE INDEX idx_kb_articles_category ON public.kb_articles(category_id);
CREATE INDEX idx_kb_articles_content_type ON public.kb_articles(content_type);
CREATE INDEX idx_kb_articles_featured ON public.kb_articles(featured);
CREATE INDEX idx_kb_articles_search_vector ON public.kb_articles USING GIN(search_vector);
CREATE INDEX idx_kb_categories_parent ON public.kb_categories(parent_id);
CREATE INDEX idx_kb_categories_active ON public.kb_categories(is_active);
CREATE INDEX idx_kb_article_revisions_article ON public.kb_article_revisions(article_id);

-- Enable Row Level Security
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories
CREATE POLICY "Anyone can view active categories" 
ON public.kb_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.kb_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Articles
CREATE POLICY "Anyone can view published articles" 
ON public.kb_articles 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage all articles" 
ON public.kb_articles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Article Revisions
CREATE POLICY "Admins can view all revisions" 
ON public.kb_article_revisions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage revisions" 
ON public.kb_article_revisions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Tags
CREATE POLICY "Anyone can view tags" 
ON public.kb_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tags" 
ON public.kb_tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Article Tags
CREATE POLICY "Anyone can view article tags" 
ON public.kb_article_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage article tags" 
ON public.kb_article_tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Functions for maintaining search vectors and revision tracking
CREATE OR REPLACE FUNCTION public.update_kb_article_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '') || ' ' || 
    COALESCE(NEW.excerpt, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.create_kb_article_revision()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_kb_tag_usage_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER kb_article_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_kb_article_search_vector();

CREATE TRIGGER kb_article_revision_trigger
  AFTER UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.create_kb_article_revision();

CREATE TRIGGER kb_tag_usage_count_trigger
  AFTER INSERT OR DELETE ON public.kb_article_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_kb_tag_usage_count();

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_kb_categories_updated_at
  BEFORE UPDATE ON public.kb_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories
INSERT INTO public.kb_categories (name, description, slug, display_order, icon, color) VALUES
('Features', 'Application features and functionality', 'features', 1, 'Star', '#3B82F6'),
('API & Backend', 'API endpoints and backend services', 'api-backend', 2, 'Server', '#10B981'),
('Components', 'UI components and their usage', 'components', 3, 'Component', '#8B5CF6'),
('Hooks', 'React hooks and custom logic', 'hooks', 4, 'Code', '#F59E0B'),
('Database', 'Database schema and operations', 'database', 5, 'Database', '#EF4444'),
('Business Rules', 'Business logic and rules', 'business-rules', 6, 'FileText', '#6366F1'),
('Integration', 'Third-party integrations', 'integration', 7, 'Link', '#14B8A6');

-- Insert sample articles for each category
INSERT INTO public.kb_articles (title, slug, content, excerpt, content_type, status, category_id, featured, created_by, updated_by) 
SELECT 
  'User Authentication System',
  'user-authentication-system',
  '# User Authentication System

## Overview
The application uses Supabase Auth for managing user authentication, registration, and session management.

## Features
- Email/password authentication
- Test user system for development
- Role-based access control
- Profile management integration

## Implementation Details
Authentication is handled through the `useAuth` hook which provides:
- Login/logout functionality  
- User session management
- Role checking capabilities
- Profile data integration

## Security Considerations
- Row Level Security (RLS) policies protect user data
- JWT tokens for session management
- Password requirements enforced
- Test users automatically cleaned up',
  'Comprehensive user authentication system using Supabase Auth with role-based access control',
  'feature',
  'published',
  (SELECT id FROM public.kb_categories WHERE slug = 'features' LIMIT 1),
  true,
  auth.uid(),
  auth.uid()
WHERE EXISTS (SELECT 1 FROM public.kb_categories WHERE slug = 'features');