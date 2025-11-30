import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { usePackageWaysOfWorkingData } from "./data/usePackageWaysOfWorkingData";
import type { PackageWaysOfWorking } from "./data/usePackageWaysOfWorkingData";

// Re-export type from data hook
export type { PackageWaysOfWorking };

export function usePackageWaysOfWorking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use data hook for fetching
  const { data: packageWorkflows, isLoading, error: queryError } = usePackageWaysOfWorkingData();

  const workflows = packageWorkflows || [];
  const error = queryError ? (queryError as Error).message : null;

  // Get workflow for a specific package
  const getPackageWorkflow = (packageId: string): PackageWaysOfWorking | null => {
    return workflows.find(workflow => workflow.package_id === packageId) || null;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ packageId, packageName, workflowData }: {
      packageId: string;
      packageName: string;
      workflowData: Partial<PackageWaysOfWorking>;
    }) => {
      if (!user?.id) throw new Error('No user authenticated');

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
        onboarding_activity_ids: [],
        first_week_activity_ids: [],
        ongoing_structure_activity_ids: [],
        tracking_tools_activity_ids: [],
        client_expectations_activity_ids: [],
        what_i_bring_activity_ids: [],
      };

      const { data, error } = await supabase
        .from('package_ways_of_working')
        .upsert(dataToSave, { 
          onConflict: 'trainer_id,package_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-ways-of-working', user?.id] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      if (!user?.id) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('package_ways_of_working')
        .delete()
        .eq('trainer_id', user.id)
        .eq('package_id', packageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-ways-of-working', user?.id] });
    }
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: async (validPackageIds: string[]) => {
      if (!user?.id) throw new Error('No user authenticated');

      const { data: orphanedWorkflows, error: fetchError } = await supabase
        .from('package_ways_of_working')
        .select('package_id')
        .eq('trainer_id', user.id)
        .not('package_id', 'in', `(${validPackageIds.join(',')})`);

      if (fetchError) throw fetchError;

      if (orphanedWorkflows && orphanedWorkflows.length > 0) {
        const { error: deleteError } = await supabase
          .from('package_ways_of_working')
          .delete()
          .eq('trainer_id', user.id)
          .not('package_id', 'in', `(${validPackageIds.join(',')})`);

        if (deleteError) throw deleteError;
        return orphanedWorkflows.length;
      }
      
      return 0;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-ways-of-working', user?.id] });
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (packageIds: string[]) => {
      if (!user?.id) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('package_ways_of_working')
        .delete()
        .eq('trainer_id', user.id)
        .in('package_id', packageIds);

      if (error) throw error;
      return packageIds.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-ways-of-working', user?.id] });
    }
  });

  return {
    packageWorkflows: workflows,
    loading: isLoading,
    error,
    getPackageWorkflow,
    savePackageWorkflow: async (packageId: string, packageName: string, workflowData: Partial<PackageWaysOfWorking>) => {
      return saveMutation.mutateAsync({ packageId, packageName, workflowData });
    },
    deletePackageWorkflow: async (packageId: string) => {
      return deleteMutation.mutateAsync(packageId);
    },
    cleanupOrphanedWorkflows: async (validPackageIds: string[]) => {
      return cleanupMutation.mutateAsync(validPackageIds);
    },
    bulkDeletePackageWorkflows: async (packageIds: string[]) => {
      return bulkDeleteMutation.mutateAsync(packageIds);
    },
    refetch: () => queryClient.invalidateQueries({ queryKey: ['package-ways-of-working', user?.id] })
  };
}
