import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SpecialtyCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: string;
  name: string;
  category_id?: string;
  display_order: number;
  is_active: boolean;
  requires_qualification: boolean;
  matching_keywords?: string[];
  description?: string;
  created_at: string;
  updated_at: string;
  category?: SpecialtyCategory;
}

export interface TrainingType {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  delivery_formats: string[];
  min_participants?: number;
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomSpecialtyRequest {
  id: string;
  trainer_id: string;
  requested_name: string;
  category_id?: string;
  description?: string;
  justification?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// Hook to fetch specialty categories
export function useSpecialtyCategories() {
  const [categories, setCategories] = useState<SpecialtyCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('specialty_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching specialty categories:', error);
      toast({
        title: "Error",
        description: "Failed to load specialty categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, refetch: fetchCategories };
}

// Hook to fetch specialties
export function useSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select(`
          *,
          category:specialty_categories(*)
        `)
        .eq('is_active', true)
        .order('category_id, display_order');

      if (error) throw error;
      setSpecialties(data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      toast({
        title: "Error",
        description: "Failed to load specialties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { specialties, loading, refetch: fetchSpecialties };
}

// Hook to fetch training types
export function useTrainingTypes() {
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingTypes();
  }, []);

  const fetchTrainingTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('training_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTrainingTypes(data || []);
    } catch (error) {
      console.error('Error fetching training types:', error);
      toast({
        title: "Error",
        description: "Failed to load training types",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { trainingTypes, loading, refetch: fetchTrainingTypes };
}

// Hook for custom specialty requests (admin use - all requests)
export function useCustomSpecialtyRequests() {
  const [requests, setRequests] = useState<CustomSpecialtyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_specialty_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as CustomSpecialtyRequest[]);
    } catch (error) {
      console.error('Error fetching custom specialty requests:', error);
      toast({
        title: "Error", 
        description: "Failed to load specialty requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: {
    requested_name: string;
    category_id?: string;
    description?: string;
    justification?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('custom_specialty_requests')
        .insert([{
          ...requestData,
          trainer_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Request Submitted",
        description: "Your specialty request has been submitted for review"
      });
      
      await fetchRequests();
      return data;
    } catch (error) {
      console.error('Error creating specialty request:', error);
      toast({
        title: "Error",
        description: "Failed to submit specialty request",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { requests, loading, createRequest, refetch: fetchRequests };
}

// Hook for trainer's own custom specialty requests
export function useTrainerCustomSpecialtyRequests() {
  const [requests, setRequests] = useState<CustomSpecialtyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) return;

      const { data, error } = await supabase
        .from('custom_specialty_requests')
        .select('*')
        .eq('trainer_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as CustomSpecialtyRequest[]);
    } catch (error) {
      console.error('Error fetching trainer custom specialty requests:', error);
      toast({
        title: "Error", 
        description: "Failed to load your specialty requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { requests, loading, refetch: fetchRequests };
}

// Hook to track specialty usage for analytics
export function useSpecialtyAnalytics() {
  const trackSpecialtyUsage = async (specialtyId: string, trainerId?: string) => {
    try {
      if (!trainerId) return;
      
      await supabase
        .from('specialty_usage_analytics')
        .insert([{
          specialty_id: specialtyId,
          trainer_id: trainerId
        }]);
    } catch (error) {
      console.error('Error tracking specialty usage:', error);
    }
  };

  const trackTrainingTypeUsage = async (trainingTypeId: string, trainerId?: string) => {
    try {
      if (!trainerId) return;
      
      await supabase
        .from('training_type_usage_analytics')
        .insert([{
          training_type_id: trainingTypeId,
          trainer_id: trainerId
        }]);
    } catch (error) {
      console.error('Error tracking training type usage:', error);
    }
  };

  return { trackSpecialtyUsage, trackTrainingTypeUsage };
}