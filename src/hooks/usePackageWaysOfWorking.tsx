import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PackageWaysOfWorking {
  id: string;
  trainer_id: string;
  package_id: string;
  package_name: string;
  onboarding_items: Array<{ id: string; text: string }>;
  first_week_items: Array<{ id: string; text: string }>;
  ongoing_structure_items: Array<{ id: string; text: string }>;
  tracking_tools_items: Array<{ id: string; text: string }>;
  client_expectations_items: Array<{ id: string; text: string }>;
  what_i_bring_items: Array<{ id: string; text: string }>;
  visibility: 'public' | 'post_match';
  created_at: string;
  updated_at: string;
}

export function usePackageWaysOfWorking() {
  const { user } = useAuth();
  const [packageWorkflows, setPackageWorkflows] = useState<PackageWaysOfWorking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all package ways of working for the current trainer
  const fetchPackageWorkflows = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('package_ways_of_working')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPackageWorkflows((data || []).map(item => ({
        ...item,
        onboarding_items: (item.onboarding_items as any) || [],
        first_week_items: (item.first_week_items as any) || [],
        ongoing_structure_items: (item.ongoing_structure_items as any) || [],
        tracking_tools_items: (item.tracking_tools_items as any) || [],
        client_expectations_items: (item.client_expectations_items as any) || [],
        what_i_bring_items: (item.what_i_bring_items as any) || [],
        visibility: (item.visibility as 'public' | 'post_match') || 'public'
      })));
    } catch (err) {
      console.error('Error fetching package workflows:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch package workflows');
    } finally {
      setLoading(false);
    }
  };

  // Get workflow for a specific package
  const getPackageWorkflow = (packageId: string): PackageWaysOfWorking | null => {
    return packageWorkflows.find(workflow => workflow.package_id === packageId) || null;
  };

  // Create or update package workflow
  const savePackageWorkflow = async (
    packageId: string, 
    packageName: string, 
    workflowData: Partial<PackageWaysOfWorking>
  ) => {
    if (!user?.id) throw new Error('No user authenticated');

    try {
      const existingWorkflow = getPackageWorkflow(packageId);
      
      const dataToSave = {
        trainer_id: user.id,
        package_id: packageId,
        package_name: packageName,
        onboarding_items: workflowData.onboarding_items || existingWorkflow?.onboarding_items || [],
        first_week_items: workflowData.first_week_items || existingWorkflow?.first_week_items || [],
        ongoing_structure_items: workflowData.ongoing_structure_items || existingWorkflow?.ongoing_structure_items || [],
        tracking_tools_items: workflowData.tracking_tools_items || existingWorkflow?.tracking_tools_items || [],
        client_expectations_items: workflowData.client_expectations_items || existingWorkflow?.client_expectations_items || [],
        what_i_bring_items: workflowData.what_i_bring_items || existingWorkflow?.what_i_bring_items || [],
        visibility: workflowData.visibility || existingWorkflow?.visibility || 'public',
      };

      // Use upsert to handle both insert and update cases
      const result = await supabase
        .from('package_ways_of_working')
        .upsert(dataToSave, { 
          onConflict: 'trainer_id,package_id'
        })
        .select()
        .single();

      if (result.error) throw result.error;

      // Refresh the workflows
      await fetchPackageWorkflows();
      
      return result.data;
    } catch (err) {
      console.error('Error saving package workflow:', err);
      throw err;
    }
  };

  // Delete a package workflow
  const deletePackageWorkflow = async (packageId: string) => {
    if (!user?.id) throw new Error('No user authenticated');

    try {
      const { error } = await supabase
        .from('package_ways_of_working')
        .delete()
        .eq('trainer_id', user.id)
        .eq('package_id', packageId);

      if (error) throw error;

      // Refresh the workflows
      await fetchPackageWorkflows();
    } catch (err) {
      console.error('Error deleting package workflow:', err);
      throw err;
    }
  };

  // Initialize data
  useEffect(() => {
    if (user?.id) {
      fetchPackageWorkflows();
    }
  }, [user?.id]);

  return {
    packageWorkflows,
    loading,
    error,
    getPackageWorkflow,
    savePackageWorkflow,
    deletePackageWorkflow,
    refetch: fetchPackageWorkflows
  };
}