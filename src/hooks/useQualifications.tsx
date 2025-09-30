import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthService } from '@/services';

export interface PopularQualification {
  id: string;
  name: string;
  category: string;
  display_order: number;
  requires_verification: boolean;
  is_active: boolean;
  description?: string;
  verification_requirements?: any;
  created_at: string;
  updated_at: string;
}

export interface CustomQualificationRequest {
  id: string;
  trainer_id: string;
  qualification_name: string;
  category: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  usage_count?: number;
  similar_existing_qualification_id?: string;
}

export interface QualificationUsageStat {
  id: string;
  qualification_id: string;
  trainer_id: string;
  selected_at: string;
  qualification_type: 'popular' | 'custom';
}

// Hook to fetch popular qualifications
export const usePopularQualifications = () => {
  return useQuery({
    queryKey: ['popular-qualifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_qualifications')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as PopularQualification[];
    },
  });
};

// Hook to fetch all qualifications for admin
export const useAllQualifications = () => {
  return useQuery({
    queryKey: ['all-qualifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_qualifications')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as PopularQualification[];
    },
  });
};

// Hook to fetch custom qualification requests
export const useCustomQualificationRequests = (status?: string) => {
  return useQuery({
    queryKey: ['custom-qualification-requests', status],
    queryFn: async () => {
      let query = supabase
        .from('custom_qualification_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook to fetch trainer's own custom qualification requests
export const useTrainerCustomRequests = () => {
  return useQuery({
    queryKey: ['trainer-custom-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_qualification_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CustomQualificationRequest[];
    },
  });
};

// Hook to create a new popular qualification (admin only)
export const useCreateQualification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (qualification: Omit<PopularQualification, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('popular_qualifications')
        .insert([qualification])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popular-qualifications'] });
      queryClient.invalidateQueries({ queryKey: ['all-qualifications'] });
      toast.success('Qualification created successfully');
    },
    onError: (error) => {
      console.error('Error creating qualification:', error);
      toast.error('Failed to create qualification');
    },
  });
};

// Hook to update a qualification (admin only)
export const useUpdateQualification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PopularQualification> }) => {
      const { data, error } = await supabase
        .from('popular_qualifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popular-qualifications'] });
      queryClient.invalidateQueries({ queryKey: ['all-qualifications'] });
      toast.success('Qualification updated successfully');
    },
    onError: (error) => {
      console.error('Error updating qualification:', error);
      toast.error('Failed to update qualification');
    },
  });
};

// Hook to create a custom qualification request (trainer)
export const useCreateCustomQualificationRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: Omit<CustomQualificationRequest, 'id' | 'trainer_id' | 'status' | 'created_at' | 'updated_at'>) => {
      const userResponse = await AuthService.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('custom_qualification_requests')
        .insert([{
          ...request,
          trainer_id: userResponse.data.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-custom-requests'] });
      queryClient.invalidateQueries({ queryKey: ['custom-qualification-requests'] });
      toast.success('Custom qualification request submitted for review');
    },
    onError: (error) => {
      console.error('Error creating custom qualification request:', error);
      toast.error('Failed to submit qualification request');
    },
  });
};

// Hook to review a custom qualification request (admin only)
export const useReviewCustomQualification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      admin_notes, 
      promote_to_popular 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      admin_notes?: string;
      promote_to_popular?: boolean;
    }) => {
      const { data: request, error: requestError } = await supabase
        .from('custom_qualification_requests')
        .update({
          status,
          admin_notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (requestError) throw requestError;
      
      // If approved and should be promoted to popular qualification
      if (status === 'approved' && promote_to_popular && request) {
        const { error: qualError } = await supabase
          .from('popular_qualifications')
          .insert([{
            name: request.qualification_name,
            category: request.category,
            description: request.description,
            requires_verification: true,
            is_active: true,
          }]);
        
        if (qualError) throw qualError;
      }
      
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-qualification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['popular-qualifications'] });
      queryClient.invalidateQueries({ queryKey: ['all-qualifications'] });
      toast.success('Qualification request reviewed successfully');
    },
    onError: (error) => {
      console.error('Error reviewing qualification request:', error);
      toast.error('Failed to review qualification request');
    },
  });
};

// Hook to track qualification usage
export const useTrackQualificationUsage = () => {
  return useMutation({
    mutationFn: async ({ 
      qualification_id, 
      qualification_type 
    }: { 
      qualification_id: string; 
      qualification_type: 'popular' | 'custom';
    }) => {
      const userResponse = await AuthService.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('qualification_usage_stats')
        .insert([{
          qualification_id,
          qualification_type,
          trainer_id: userResponse.data.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error tracking qualification usage:', error);
    },
  });
};

// Hook to get qualification usage analytics (admin only)
export const useQualificationAnalytics = () => {
  return useQuery({
    queryKey: ['qualification-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qualification_usage_stats')
        .select(`
          qualification_id,
          qualification_type,
          popular_qualifications(name, category)
        `);
      
      if (error) throw error;
      return data;
    },
  });
};