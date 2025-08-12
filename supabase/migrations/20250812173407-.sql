-- Add template status and package linking capabilities
ALTER TABLE trainer_onboarding_templates 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS created_from_template_id uuid REFERENCES trainer_onboarding_templates(id),
ADD COLUMN IF NOT EXISTS package_links jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS auto_assign_on_package boolean DEFAULT false;

-- Create table for template package links if more structured approach needed
CREATE TABLE IF NOT EXISTS template_package_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES trainer_onboarding_templates(id) ON DELETE CASCADE,
  package_id text NOT NULL,
  package_name text NOT NULL,
  auto_assign boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on template_package_links
ALTER TABLE template_package_links ENABLE ROW LEVEL SECURITY;

-- Create policies for template_package_links
CREATE POLICY "Trainers can manage their template package links"
ON template_package_links
FOR ALL
USING (EXISTS (
  SELECT 1 FROM trainer_onboarding_templates t
  WHERE t.id = template_package_links.template_id
  AND t.trainer_id = auth.uid()
));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_template_package_links_template_id ON template_package_links(template_id);
CREATE INDEX IF NOT EXISTS idx_template_package_links_package_id ON template_package_links(package_id);