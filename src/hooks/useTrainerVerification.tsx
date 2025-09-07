import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  trainer_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resubmitted';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  rejection_reason?: string;
  documents_provided: any;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

interface TrainerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_verified: boolean; // Optional for compatibility - synced with verification_status
  verification_requested_at?: string; // Optional for compatibility  
  verification_documents?: any; // Optional for compatibility
  admin_review_notes?: string; // Optional for compatibility
}

export function useTrainerVerification() {
  const { user } = useAuth();
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [trainerProfiles, setTrainerProfiles] = useState<TrainerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');
        
      setIsAdmin(data && data.length > 0);
    };

    checkAdminStatus();
  }, [user]);

  // Fetch trainer's own verification request
  const fetchTrainerVerificationRequest = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trainer_verification_requests')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setVerificationRequest(data);
    } catch (error) {
      console.error('Error fetching verification request:', error);
    }
  }, [user]);

  // Fetch all verification requests (admin only)
  const fetchAllVerificationRequests = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('trainer_verification_requests')
        .select(`
          *,
          profiles!trainer_verification_requests_trainer_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerificationRequests(data || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    }
  }, [isAdmin]);

  // Fetch trainer profiles for admin verification
  const fetchTrainerProfiles = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('v_trainers')
        .select(`
          id,
          first_name,
          last_name,
          verification_status,
          is_verified
        `)
        .order('id', { ascending: false }); // Use id instead of created_at since created_at doesn't exist in v_trainers

      if (error) throw error;
      
      // Get emails from auth.users through edge function
      const { data: emails } = await supabase.functions.invoke('get-user-emails');
      
      const profilesWithEmails = (data || []).map(profile => ({
        ...profile,
        verification_status: (profile.verification_status || 'pending') as 'pending' | 'verified' | 'rejected',
        email: emails?.find((e: any) => e.user_id === profile.id)?.email || 'N/A'
      }));

      setTrainerProfiles(profilesWithEmails);
    } catch (error) {
      console.error('Error fetching trainer profiles:', error);
    }
  }, [isAdmin]);

  // Submit verification request
  const submitVerificationRequest = async (documents: any[] = []) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('request_trainer_verification', {
        p_documents: documents
      });

      if (error) throw error;
      
      toast.success('Verification request submitted successfully!');
      await fetchTrainerVerificationRequest();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit verification request');
      throw error;
    }
  };

  // Update verification status (admin only)
  const updateVerificationStatus = async (
    trainerId: string,
    status: 'pending' | 'verified' | 'rejected',
    adminNotes?: string,
    rejectionReason?: string
  ) => {
    if (!isAdmin) throw new Error('Unauthorized');

    try {
      const { error } = await supabase.rpc('update_trainer_verification_status', {
        p_trainer_id: trainerId,
        p_status: status,
        p_admin_notes: adminNotes,
        p_rejection_reason: rejectionReason
      });

      if (error) throw error;
      
      toast.success(`Verification status updated to ${status}`);
      await Promise.all([
        fetchAllVerificationRequests(),
        fetchTrainerProfiles()
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update verification status');
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          await Promise.all([
            fetchAllVerificationRequests(),
            fetchTrainerProfiles()
          ]);
        } else {
          await fetchTrainerVerificationRequest();
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, isAdmin, fetchTrainerVerificationRequest, fetchAllVerificationRequests, fetchTrainerProfiles]);

  return {
    // Data
    verificationRequest,
    verificationRequests,
    trainerProfiles,
    loading,
    isAdmin,
    
    // Actions
    submitVerificationRequest,
    updateVerificationStatus,
    refetch: isAdmin 
      ? () => Promise.all([fetchAllVerificationRequests(), fetchTrainerProfiles()])
      : fetchTrainerVerificationRequest
  };
}