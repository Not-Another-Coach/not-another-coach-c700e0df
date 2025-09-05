import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VerificationCheck {
  id: string;
  trainer_id: string;
  check_type: 'cimspa_membership' | 'insurance_proof' | 'first_aid_certification' | 'qualifications' | 'identity_match';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  provider?: string;
  awarding_body?: string;
  member_id?: string;
  certificate_id?: string;
  policy_number?: string;
  level?: number;
  coverage_amount?: number;
  issue_date?: string;
  expiry_date?: string;
  evidence_file_url?: string;
  evidence_metadata?: any;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface VerificationOverview {
  id: string;
  trainer_id: string;
  display_preference: 'verified_allowed' | 'hidden';
  overall_status: 'verified' | 'not_shown' | 'expired';
  last_computed_at: string;
  created_at: string;
  updated_at: string;
}

interface VerificationAuditEntry {
  id: string;
  trainer_id: string;
  check_id?: string;
  actor: 'admin' | 'trainer' | 'system';
  actor_id?: string;
  action: 'upload' | 'verify' | 'reject' | 'delete' | 'toggle_preference' | 'expire';
  previous_status?: string;
  new_status?: string;
  reason?: string;
  metadata?: any;
  created_at: string;
}

export const useEnhancedTrainerVerification = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<VerificationOverview | null>(null);
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [auditLog, setAuditLog] = useState<VerificationAuditEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, [user]);

  // Fetch trainer's verification data
  const fetchVerificationData = useCallback(async (trainerId?: string) => {
    if (!user) return;
    
    const targetTrainerId = trainerId || user.id;
    setLoading(true);

    try {
      // Fetch overview
      const { data: overviewData } = await supabase
        .from('trainer_verification_overview')
        .select('*')
        .eq('trainer_id', targetTrainerId)
        .single();

      setOverview(overviewData);

      // Fetch checks
      const { data: checksData } = await supabase
        .from('trainer_verification_checks')
        .select('*')
        .eq('trainer_id', targetTrainerId)
        .order('check_type');

      setChecks(checksData || []);

      // Fetch audit log (only if admin or own data)
      if (isAdmin || targetTrainerId === user.id) {
        const { data: auditData } = await supabase
          .from('trainer_verification_audit_log')
          .select('*')
          .eq('trainer_id', targetTrainerId)
          .order('created_at', { ascending: false })
          .limit(50);

        setAuditLog(auditData || []);
      }
    } catch (error) {
      console.error('Error fetching verification data:', error);
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Update verification preference toggle
  const updateDisplayPreference = useCallback(async (preference: 'verified_allowed' | 'hidden') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trainer_verification_overview')
        .upsert({
          trainer_id: user.id,
          display_preference: preference,
        });

      if (error) throw error;

      setOverview(prev => prev ? { ...prev, display_preference: preference } : null);
      toast.success(`Verification badge ${preference === 'verified_allowed' ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating display preference:', error);
      toast.error('Failed to update preference');
    }
  }, [user]);

  // Submit verification check
  const submitVerificationCheck = useCallback(async (
    checkType: VerificationCheck['check_type'],
    data: Partial<VerificationCheck>
  ) => {
    if (!user) return;

    try {
      const checkData = {
        trainer_id: user.id,
        check_type: checkType,
        status: 'pending' as const,
        provider: data.provider || null,
        awarding_body: data.awarding_body || null,
        member_id: data.member_id || null,
        certificate_id: data.certificate_id || null,
        policy_number: data.policy_number || null,
        level: data.level || null,
        coverage_amount: data.coverage_amount || null,
        issue_date: data.issue_date || null,
        expiry_date: data.expiry_date || null,
        evidence_file_url: data.evidence_file_url || null,
        evidence_metadata: data.evidence_metadata || null,
      };

      console.log('Upserting verification check:', checkData);

      const { data: result, error } = await supabase
        .from('trainer_verification_checks')
        .upsert(checkData, { 
          onConflict: 'trainer_id,check_type'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Verification check saved:', result);

      // Refresh data
      await fetchVerificationData();
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
    }
  }, [user, fetchVerificationData]);

  // Upload document to storage
  const uploadDocument = useCallback(async (
    checkType: VerificationCheck['check_type'],
    file: File
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${checkType}_${Date.now()}.${fileExt}`;
      const filePath = `trainer-verification-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trainer-verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      return filePath;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    }
  }, [user]);

  // Admin function to update verification check status
  const adminUpdateCheck = useCallback(async (
    trainerId: string,
    checkType: VerificationCheck['check_type'],
    status: VerificationCheck['status'],
    adminNotes?: string,
    rejectionReason?: string
  ) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase.rpc('admin_update_verification_check', {
        p_trainer_id: trainerId,
        p_check_type: checkType,
        p_status: status,
        p_admin_notes: adminNotes,
        p_rejection_reason: rejectionReason,
      });

      if (error) throw error;

      // Refresh data
      await fetchVerificationData(trainerId);
      toast.success(`Verification check ${status}`);
    } catch (error) {
      console.error('Error updating verification check:', error);
      toast.error('Failed to update verification check');
    }
  }, [isAdmin, fetchVerificationData]);

  // Get verification check by type
  const getCheckByType = useCallback((type: VerificationCheck['check_type']) => {
    return checks.find(check => check.check_type === type);
  }, [checks]);

  // Get overall verification badge status
  const getVerificationBadgeStatus = useCallback(() => {
    if (!overview) return 'hidden';
    
    return overview.overall_status === 'verified' && overview.display_preference === 'verified_allowed' 
      ? 'verified' 
      : 'hidden';
  }, [overview]);

  // Initialize data on mount
  useEffect(() => {
    if (user) {
      fetchVerificationData();
    }
  }, [user, fetchVerificationData]);

  return {
    loading,
    overview,
    checks,
    auditLog,
    isAdmin,
    fetchVerificationData,
    updateDisplayPreference,
    submitVerificationCheck,
    uploadDocument,
    adminUpdateCheck,
    getCheckByType,
    getVerificationBadgeStatus,
  };
};