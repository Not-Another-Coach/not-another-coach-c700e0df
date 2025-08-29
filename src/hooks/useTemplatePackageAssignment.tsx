import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useTemplateBuilder } from './useTemplateBuilder';
import { useTrainerActivities } from './useTrainerActivities';

interface PackageTemplateAssignment {
  packageId: string;
  packageName: string;
  templateId?: string;
  templateName?: string;
  activities: Array<{
    id: string;
    name: string;
    category: string;
    included: boolean;
  }>;
}

interface ActivityAssignment {
  id: string;
  template_id: string;
  activity_id: string;
  created_at: string;
}

export function useTemplatePackageAssignment() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { templates, packageLinks, linkToPackage, unlinkFromPackage } = useTemplateBuilder();
  const { activities } = useTrainerActivities();
  
  const [assignments, setAssignments] = useState<PackageTemplateAssignment[]>([]);
  const [activityAssignments, setActivityAssignments] = useState<ActivityAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get packages from profile
  const packages = (profile as any)?.package_options || [];

  // Fetch activity assignments for all templates
  const fetchActivityAssignments = useCallback(async () => {
    if (!user || templates.length === 0) return;

    try {
      const templateIds = templates.map(t => t.id);
      const { data, error } = await supabase
        .from('template_activities')
        .select('*')
        .in('template_id', templateIds);

      if (error) throw error;
      setActivityAssignments(data || []);
    } catch (err) {
      console.error('Error fetching template activities:', err);
    }
  }, [user, templates]);

  const buildAssignments = useCallback(() => {
    if (!packages || !Array.isArray(packages)) {
      setAssignments([]);
      return;
    }

    const packageAssignments = packages.map((pkg: any) => {
      // Find template linked to this package
      const linkedTemplate = packageLinks.find(link => 
        link.package_id === (pkg.id || pkg.package_id || pkg.name)
      );
      
      const template = linkedTemplate ? 
        templates.find(t => t.id === linkedTemplate.template_id) : 
        undefined;

      // Get assigned activity IDs for this template
      const assignedActivityIds = template ? 
        activityAssignments
          .filter(aa => aa.template_id === template.id)
          .map(aa => aa.activity_id) : 
        [];

      // Map all activities with inclusion status based on actual template-activity assignments
      const templateActivities = activities.map(activity => ({
        id: activity.id,
        name: activity.activity_name,
        category: activity.category,
        included: !!template && assignedActivityIds.includes(activity.id)
      }));

      return {
        packageId: pkg.id || pkg.package_id || pkg.name,
        packageName: pkg.name || pkg.package_name || 'Unnamed Package',
        templateId: template?.id,
        templateName: template?.step_name,
        activities: templateActivities
      };
    });

    setAssignments(packageAssignments);
  }, [packages, packageLinks, templates, activities, activityAssignments]);

  useEffect(() => {
    fetchActivityAssignments();
  }, [fetchActivityAssignments]);

  useEffect(() => {
    buildAssignments();
  }, [buildAssignments]);

  const assignTemplate = useCallback(async (packageId: string, templateId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    setError(null);

    try {
      const pkg = packages.find((p: any) => 
        (p.id || p.package_id || p.name) === packageId
      );
      const template = templates.find(t => t.id === templateId);

      if (!pkg || !template) {
        throw new Error('Package or template not found');
      }

      // Check if package is already linked to another template
      const existingLink = packageLinks.find(link => link.package_id === packageId);
      if (existingLink && existingLink.template_id !== templateId) {
        // Unlink existing template first
        await unlinkFromPackage(existingLink.template_id, packageId);
      }

      // Link new template
      await linkToPackage(
        templateId, 
        packageId, 
        pkg.name || pkg.package_name || 'Unnamed Package',
        true // auto_assign
      );

      buildAssignments();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign template';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, packages, templates, packageLinks, linkToPackage, unlinkFromPackage, buildAssignments]);

  const unassignTemplate = useCallback(async (packageId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    setError(null);

    try {
      const existingLink = packageLinks.find(link => link.package_id === packageId);
      if (existingLink) {
        await unlinkFromPackage(existingLink.template_id, packageId);
        buildAssignments();
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unassign template';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, packageLinks, unlinkFromPackage, buildAssignments]);

  return {
    assignments,
    templates,
    loading,
    error,
    assignTemplate,
    unassignTemplate,
    refetch: () => {
      fetchActivityAssignments();
      buildAssignments();
    }
  };
}