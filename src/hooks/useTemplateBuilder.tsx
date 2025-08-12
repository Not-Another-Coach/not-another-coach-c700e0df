import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingTemplate } from '@/hooks/useTrainerOnboarding';

interface ExtendedTemplate extends OnboardingTemplate {
  status?: 'draft' | 'published' | 'archived';
  created_from_template_id?: string;
  package_links?: string[];
  auto_assign_on_package?: boolean;
}

interface TemplatePackageLink {
  id: string;
  template_id: string;
  package_id: string;
  package_name: string;
  auto_assign: boolean;
}

export function useTemplateBuilder() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ExtendedTemplate[]>([]);
  const [packageLinks, setPackageLinks] = useState<TemplatePackageLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trainer_onboarding_templates')
        .select('*')
        .eq('trainer_id', user.id)
        .order('display_order');

      if (error) throw error;

      setTemplates((data || []).map(template => ({
        ...template,
        step_type: template.step_type as 'mandatory' | 'optional',
        completion_method: template.completion_method as 'client' | 'trainer' | 'auto',
        status: (template.status as 'draft' | 'published' | 'archived') || 'draft',
        package_links: Array.isArray(template.package_links) 
          ? (template.package_links as string[]) 
          : []
      })));
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPackageLinks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('template_package_links')
        .select('*')
        .in('template_id', templates.map(t => t.id));

      if (error) throw error;

      setPackageLinks(data || []);
    } catch (err) {
      console.error('Error fetching package links:', err);
    }
  }, [templates]);

  React.useEffect(() => {
    if (templates.length > 0) {
      fetchPackageLinks();
    }
  }, [fetchPackageLinks]);

  const createTemplate = useCallback(async (template: Omit<ExtendedTemplate, 'id'>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .insert({
          trainer_id: user.id,
          ...template,
          status: template.status || 'draft'
        });

      if (error) throw error;

      await fetchTemplates();
    } catch (err) {
      console.error('Error creating template:', err);
      throw err;
    }
  }, [user, fetchTemplates]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ExtendedTemplate>) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .update(updates)
        .eq('id', templateId)
        .eq('trainer_id', user.id);

      if (error) throw error;

      await fetchTemplates();
    } catch (err) {
      console.error('Error updating template:', err);
      throw err;
    }
  }, [user, fetchTemplates]);

  const duplicateTemplate = useCallback(async (templateId: string) => {
    if (!user) throw new Error('No user');

    try {
      // Get the original template
      const { data: originalTemplate, error: fetchError } = await supabase
        .from('trainer_onboarding_templates')
        .select('*')
        .eq('id', templateId)
        .eq('trainer_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Create the duplicate with a new name and reference to original
      const { error: insertError } = await supabase
        .from('trainer_onboarding_templates')
        .insert({
          trainer_id: user.id,
          step_name: `${originalTemplate.step_name} (Copy)`,
          step_type: originalTemplate.step_type,
          description: originalTemplate.description,
          instructions: originalTemplate.instructions,
          requires_file_upload: originalTemplate.requires_file_upload,
          completion_method: originalTemplate.completion_method,
          display_order: templates.length,
          is_active: false, // Start as inactive
          status: 'draft', // Always start as draft
          created_from_template_id: templateId
        });

      if (insertError) throw insertError;

      await fetchTemplates();
    } catch (err) {
      console.error('Error duplicating template:', err);
      throw err;
    }
  }, [user, templates.length, fetchTemplates]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('trainer_onboarding_templates')
        .delete()
        .eq('id', templateId)
        .eq('trainer_id', user.id);

      if (error) throw error;

      await fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      throw err;
    }
  }, [user, fetchTemplates]);

  const reorderTemplates = useCallback(async (reorderedTemplates: ExtendedTemplate[]) => {
    if (!user) throw new Error('No user');

    try {
      // Update display_order for all templates
      const updates = reorderedTemplates.map((template, index) => ({
        id: template.id,
        display_order: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('trainer_onboarding_templates')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
          .eq('trainer_id', user.id);

        if (error) throw error;
      }

      await fetchTemplates();
    } catch (err) {
      console.error('Error reordering templates:', err);
      throw err;
    }
  }, [user, fetchTemplates]);

  const publishTemplate = useCallback(async (templateId: string) => {
    await updateTemplate(templateId, { status: 'published' });
  }, [updateTemplate]);

  const archiveTemplate = useCallback(async (templateId: string) => {
    await updateTemplate(templateId, { status: 'archived' });
  }, [updateTemplate]);

  const linkToPackage = useCallback(async (templateId: string, packageId: string, packageName: string, autoAssign = true) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('template_package_links')
        .insert({
          template_id: templateId,
          package_id: packageId,
          package_name: packageName,
          auto_assign: autoAssign
        });

      if (error) throw error;

      await fetchPackageLinks();
    } catch (err) {
      console.error('Error linking template to package:', err);
      throw err;
    }
  }, [user, fetchPackageLinks]);

  const unlinkFromPackage = useCallback(async (templateId: string, packageId: string) => {
    if (!user) throw new Error('No user');

    try {
      const { error } = await supabase
        .from('template_package_links')
        .delete()
        .eq('template_id', templateId)
        .eq('package_id', packageId);

      if (error) throw error;

      await fetchPackageLinks();
    } catch (err) {
      console.error('Error unlinking template from package:', err);
      throw err;
    }
  }, [user, fetchPackageLinks]);

  const getTemplatesByPackage = useCallback((packageId: string) => {
    const linkedTemplateIds = packageLinks
      .filter(link => link.package_id === packageId && link.auto_assign)
      .map(link => link.template_id);
    
    return templates.filter(template => 
      linkedTemplateIds.includes(template.id) && 
      template.status === 'published' &&
      template.is_active
    );
  }, [templates, packageLinks]);

  // Load templates on mount
  React.useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user, fetchTemplates]);

  return {
    templates,
    packageLinks,
    loading,
    error,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    reorderTemplates,
    publishTemplate,
    archiveTemplate,
    linkToPackage,
    unlinkFromPackage,
    getTemplatesByPackage,
    fetchTemplates,
    fetchPackageLinks
  };
}