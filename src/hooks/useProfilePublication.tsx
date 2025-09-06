import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface PublicationRequest {
  id: string;
  trainer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  trainer?: {
    first_name: string;
    last_name: string;
    verification_status?: string;
  } | null;
}

export const useProfilePublication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<PublicationRequest | null>(null);
  
  // Fetch current user's publication request
  const fetchCurrentRequest = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profile_publication_requests')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      setCurrentRequest(data);
    } catch (error) {
      console.error('Error fetching publication request:', error);
    }
  }, [user?.id]);

  // Submit publication request
  const requestPublication = async () => {
    if (!user?.id) return false;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('request_profile_publication');
      
      if (error) throw error;
      
      toast({
        title: "Publication Request Submitted",
        description: "Your profile has been submitted for admin review. You'll be notified when it's approved.",
      });
      
      await fetchCurrentRequest();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit publication request",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if profile is ready to publish
  const isProfileReadyToPublish = (profile: any, stepValidation: any) => {
    if (!profile || !stepValidation) return false;
    
    // All steps should be green except verification (step 14)
    const requiredSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    
    return requiredSteps.every(step => {
      const completion = stepValidation.getStepCompletion(profile, step);
      return completion === 'completed';
    });
  };

  useEffect(() => {
    if (user?.id) {
      fetchCurrentRequest();
    }
  }, [user?.id, fetchCurrentRequest]);

  return {
    currentRequest,
    loading,
    requestPublication,
    isProfileReadyToPublish,
    fetchCurrentRequest
  };
};

// Admin hook for managing all publication requests
export const useAdminProfilePublication = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PublicationRequest[]>([]);

  // Fetch all publication requests
  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_publication_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get trainer details separately to avoid foreign key issues
      const requestsWithTrainerNames = await Promise.all(
        (data || []).map(async (request) => {
          const { data: trainerData } = await supabase
            .from('profiles')
            .select('first_name, last_name, verification_status')
            .eq('id', request.trainer_id)
            .single();
            
          return {
            ...request,
            trainer: trainerData
          };
        })
      );
      
      setRequests(requestsWithTrainerNames);
    } catch (error) {
      console.error('Error fetching publication requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch publication requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Review publication request
  const reviewRequest = async (
    requestId: string, 
    action: 'approved' | 'rejected', 
    adminNotes?: string, 
    rejectionReason?: string
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('review_profile_publication', {
        p_request_id: requestId,
        p_action: action,
        p_admin_notes: adminNotes,
        p_rejection_reason: rejectionReason
      });
      
      if (error) throw error;
      
      toast({
        title: `Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Publication request has been ${action}.`,
      });
      
      await fetchAllRequests();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} request`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  return {
    requests,
    loading,
    reviewRequest,
    fetchAllRequests
  };
};