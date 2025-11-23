import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadService } from '@/services';
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

  // Fetch trainer's verification data (optimized) - no admin state dependency to prevent double-fetch
  const fetchVerificationData = useCallback(async (trainerId?: string) => {
    if (!user) return;
    
    const targetTrainerId = trainerId || user.id;
    setLoading(true);

    try {
      // Check admin role inline to avoid double-fetch from state changes
      const { data: adminData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      const isAdminUser = !!adminData;
      setIsAdmin(isAdminUser);

      // Batch all data fetching in parallel for better performance
      const [overviewResult, checksResult, auditResult] = await Promise.all([
        supabase
          .from('trainer_verification_overview')
          .select('*')
          .eq('trainer_id', targetTrainerId)
          .maybeSingle(),
        supabase
          .from('trainer_verification_checks')
          .select('*')
          .eq('trainer_id', targetTrainerId)
          .order('check_type'),
        (isAdminUser || targetTrainerId === user.id) 
          ? supabase
              .from('trainer_verification_audit_log')
              .select('*')
              .eq('trainer_id', targetTrainerId)
              .order('created_at', { ascending: false })
              .limit(50)
          : Promise.resolve({ data: [] })
      ]);

      // Handle overview data (may not exist)
      if (overviewResult.error && overviewResult.error.code !== 'PGRST116') {
        throw overviewResult.error;
      }
      setOverview(overviewResult.data);

      // Handle checks data  
      if (checksResult.error) throw checksResult.error;
      setChecks(checksResult.data || []);

      // Handle audit log data
      if ('error' in auditResult && auditResult.error) throw auditResult.error;
      setAuditLog(auditResult.data || []);
    } catch (error) {
      console.error('Error fetching verification data:', error);
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  // Upload document to storage
  const uploadDocument = useCallback(async (
    checkType: VerificationCheck['check_type'],
    file: File
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${checkType}_${Date.now()}.${fileExt}`;

      const uploadResult = await FileUploadService.uploadFile(
        'verification-documents',
        fileName,
        file
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }

      return uploadResult.data.path;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    }
  }, [user]);

  // Submit verification check
  const submitVerificationCheck = useCallback(async (
    checkType: string,
    checkData: any,
    isDraft: boolean = false,
    suppressToast: boolean = false
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if there's an existing check to preserve audit trail
      const existingCheck = checks.find(c => c.check_type === checkType);
      const isResubmission = existingCheck && existingCheck.status === 'rejected';
      const isInitialSubmission = !existingCheck;
      
      // If resubmitting after rejection, preserve audit trail
      if (isResubmission) {
        // Create audit log entry for the previous version before overwriting
        await supabase
          .from('trainer_verification_audit_log')
          .insert({
            trainer_id: user.id,
            check_id: existingCheck.id,
            actor: 'trainer',
            action: 'upload',
            previous_status: existingCheck.status,
            new_status: 'pending',
            reason: 'Resubmission after rejection',
            metadata: {
              previous_data: {
                provider: existingCheck.provider,
                member_id: existingCheck.member_id,
                certificate_id: existingCheck.certificate_id,
                policy_number: existingCheck.policy_number,
                coverage_amount: existingCheck.coverage_amount,
                issue_date: existingCheck.issue_date,
                expiry_date: existingCheck.expiry_date,
                evidence_file_url: existingCheck.evidence_file_url,
                rejection_reason: existingCheck.rejection_reason,
                admin_notes: existingCheck.admin_notes
              },
              new_data: checkData,
              is_resubmission: true,
              resubmission_timestamp: new Date().toISOString()
            }
          });
      }

      // Prepare the data for submission
      const submitData: any = {
        trainer_id: user.id,
        check_type: checkType as any,
        draft_status: isDraft ? 'draft' : 'submitted'
      };

      // Only set status to pending for actual submissions, not drafts
      if (!isDraft) {
        submitData.status = checkData.not_applicable ? 'not_applicable' : 'pending';
        submitData.submitted_at = new Date().toISOString();
      }

      // Add optional fields only if they have values
      if (checkData.provider) submitData.provider = checkData.provider;
      if (checkData.member_id) submitData.member_id = checkData.member_id;
      if (checkData.certificate_id) submitData.certificate_id = checkData.certificate_id;
      if (checkData.policy_number) submitData.policy_number = checkData.policy_number;
      if (checkData.coverage_amount) submitData.coverage_amount = checkData.coverage_amount;
      if (checkData.issue_date) submitData.issue_date = checkData.issue_date;
      if (checkData.expiry_date) submitData.expiry_date = checkData.expiry_date;
      
      // Upload file if provided
      if (checkData.file) {
        const fileUrl = await uploadDocument(checkType as any, checkData.file);
        if (!fileUrl) {
          throw new Error('Failed to upload document');
        }
        submitData.evidence_file_url = fileUrl;
        submitData.evidence_metadata = {
          filename: checkData.file.name,
          size: checkData.file.size,
          type: checkData.file.type,
        };
      }

      console.log('Submitting verification check with data:', submitData);

      const { data, error } = await supabase
        .from('trainer_verification_checks')
        .upsert(submitData, {
          onConflict: 'trainer_id,check_type'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from database after upsert');
      }

      // Create audit log entry for initial submissions or updates
      if (isInitialSubmission || !isResubmission) {
        await supabase
          .from('trainer_verification_audit_log')
          .insert({
            trainer_id: user.id,
            check_id: data.id,
            actor: 'trainer',
            action: 'upload',
            previous_status: existingCheck?.status || null,
            new_status: data.status,
            reason: checkData.not_applicable 
              ? 'Marked as not applicable' 
              : (isInitialSubmission ? 'Initial document submission' : 'Document updated'),
            metadata: {
              submission_data: {
                provider: checkData.provider,
                member_id: checkData.member_id,
                certificate_id: checkData.certificate_id,
                policy_number: checkData.policy_number,
                coverage_amount: checkData.coverage_amount,
                issue_date: checkData.issue_date,
                expiry_date: checkData.expiry_date,
                has_file: !!checkData.file,
                file_name: checkData.file?.name
              },
              is_not_applicable: checkData.not_applicable || false,
              is_initial_submission: isInitialSubmission,
              submission_timestamp: new Date().toISOString()
            }
          });
      }

      console.log('Verification check saved successfully:', data);

      // Refresh data to update UI
      await fetchVerificationData();
      
      console.log('Data refreshed after submission');
      
      // Only show success toast for actual submissions (not drafts) and when not suppressed
      if (!isDraft && !suppressToast) {
        toast.success('Verification check submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      // Show the actual error to help debug
      if (error instanceof Error) {
        toast.error(`Submission failed: ${error.message}`);
      } else {
        toast.error('Submission failed: Unknown error');
      }
      throw error;
    }
  }, [user, checks, fetchVerificationData, uploadDocument]);

  // Admin function to update verification check status
  const adminUpdateCheck = useCallback(async (
    checkId: string,
    status: VerificationCheck['status'],
    adminNotes?: string,
    rejectionReason?: string
  ) => {
    if (!isAdmin) {
      toast.error('Admin privileges required');
      return;
    }

    try {
      console.log('Calling admin_update_verification_check with:', {
        checkId,
        status,
        adminNotes,
        rejectionReason
      });

      const { data, error } = await supabase.rpc('admin_update_verification_check', {
        p_check_id: checkId,
        p_status: status,
        p_admin_notes: adminNotes || null,
        p_rejection_reason: rejectionReason || null,
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      console.log('RPC success:', data);

      // Refresh data
      await fetchVerificationData();
      toast.success(`Verification check ${status === 'verified' ? 'approved' : status}`);
    } catch (error) {
      console.error('Error updating verification check:', error);
      toast.error(`Failed to update verification check: ${error.message}`);
    }
  }, [isAdmin, fetchVerificationData]);

  // Get verification check by type
  const getCheckByType = useCallback((type: VerificationCheck['check_type']) => {
    const check = checks.find(check => check.check_type === type);
    console.log(`Getting check for type ${type}:`, check);
    return check;
  }, [checks]);

  // Get overall verification badge status
  const getVerificationBadgeStatus = useCallback(() => {
    if (!overview) return 'hidden';
    
    return overview.overall_status === 'verified' && overview.display_preference === 'verified_allowed' 
      ? 'verified' 
      : 'hidden';
  }, [overview]);

  // Initialize data on mount - removed fetchVerificationData from deps to prevent re-fetch loop
  useEffect(() => {
    if (user) {
      fetchVerificationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check if certificate is expiring within 14 days
  const isExpiringWithin14Days = useCallback((expiryDate?: string) => {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(today.getDate() + 14);
    
    return expiry <= fourteenDaysFromNow && expiry >= today;
  }, []);

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
    isExpiringWithin14Days,
  };
};