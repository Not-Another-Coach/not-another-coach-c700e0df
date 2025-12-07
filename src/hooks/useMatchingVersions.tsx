import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MatchingVersion, MatchingAlgorithmConfig, DEFAULT_MATCHING_CONFIG } from "@/types/matching";

const QUERY_KEY = ['matching-algorithm-versions'];

export function useMatchingVersions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matching_algorithm_versions')
        .select('*')
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching matching versions:', error);
        throw error;
      }

      return (data || []).map(d => ({
        ...d,
        config: d.config as unknown as MatchingAlgorithmConfig
      })) as MatchingVersion[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useLiveMatchingVersion() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matching_algorithm_versions')
        .select('*')
        .eq('status', 'live')
        .maybeSingle();

      if (error) {
        console.error('Error fetching live matching version:', error);
        throw error;
      }

      if (!data) return null;
      return {
        ...data,
        config: data.config as unknown as MatchingAlgorithmConfig
      } as MatchingVersion;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMatchingVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, notes, config }: { name: string; notes?: string; config?: MatchingAlgorithmConfig }) => {
      // Get the next version number
      const { data: versions } = await supabase
        .from('matching_algorithm_versions')
        .select('version_number')
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      const { data, error } = await supabase
        .from('matching_algorithm_versions')
        .insert({
          name,
          version_number: nextVersion,
          config: (config || DEFAULT_MATCHING_CONFIG) as unknown as Record<string, unknown>,
          status: 'draft',
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, config: data.config as unknown as MatchingAlgorithmConfig } as MatchingVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('New version created as draft');
    },
    onError: (error) => {
      console.error('Error creating version:', error);
      toast.error('Failed to create new version');
    },
  });
}

export function useCloneMatchingVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceVersionId, notes }: { sourceVersionId: string; notes?: string }) => {
      // Get source version
      const { data: source, error: sourceError } = await supabase
        .from('matching_algorithm_versions')
        .select('*')
        .eq('id', sourceVersionId)
        .single();

      if (sourceError || !source) throw sourceError || new Error('Source version not found');

      // Get next version number
      const { data: versions } = await supabase
        .from('matching_algorithm_versions')
        .select('version_number')
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      const { data, error } = await supabase
        .from('matching_algorithm_versions')
        .insert({
          name: source.name,
          version_number: nextVersion,
          config: source.config as unknown as Record<string, unknown>,
          status: 'draft',
          notes: notes || `Cloned from v${source.version_number}`,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, config: data.config as unknown as MatchingAlgorithmConfig } as MatchingVersion;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`Created v${data.version_number} as draft`);
    },
    onError: (error) => {
      console.error('Error cloning version:', error);
      toast.error('Failed to clone version');
    },
  });
}

export function useUpdateMatchingVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, config, name, notes }: { id: string; config?: MatchingAlgorithmConfig; name?: string; notes?: string }) => {
      const updates: Record<string, unknown> = {};
      if (config !== undefined) updates.config = config as unknown as Record<string, unknown>;
      if (name !== undefined) updates.name = name;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from('matching_algorithm_versions')
        .update(updates)
        .eq('id', id)
        .eq('status', 'draft') // Can only update drafts
        .select()
        .single();

      if (error) throw error;
      return { ...data, config: data.config as unknown as MatchingAlgorithmConfig } as MatchingVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Draft saved');
    },
    onError: (error) => {
      console.error('Error updating version:', error);
      toast.error('Failed to save draft. Only draft versions can be edited.');
    },
  });
}

export function usePublishMatchingVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First update to bypass RLS (status change from draft to live)
      // The trigger will handle archiving the previous live version
      const { data, error } = await supabase
        .from('matching_algorithm_versions')
        .update({ status: 'live' })
        .eq('id', id)
        .eq('status', 'draft')
        .select()
        .single();

      if (error) throw error;
      return { ...data, config: data.config as unknown as MatchingAlgorithmConfig } as MatchingVersion;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`Version ${data.version_number} is now live`);
    },
    onError: (error) => {
      console.error('Error publishing version:', error);
      toast.error('Failed to publish version. Only draft versions can be published.');
    },
  });
}

export function useDeleteMatchingVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('matching_algorithm_versions')
        .delete()
        .eq('id', id)
        .eq('status', 'draft'); // Can only delete drafts

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Draft deleted');
    },
    onError: (error) => {
      console.error('Error deleting version:', error);
      toast.error('Failed to delete. Only draft versions can be deleted.');
    },
  });
}
