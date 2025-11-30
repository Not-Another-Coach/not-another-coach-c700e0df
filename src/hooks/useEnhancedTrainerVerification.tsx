import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useUserRolesData } from '@/hooks/data/useUserRolesData';
import { toast } from 'sonner';
import { queryConfig } from '@/lib/queryConfig';

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

interface VerificationData {
  overview: VerificationOverview | null;
  checks: VerificationCheck[];
  auditLog: VerificationAuditEntry[];
  isAdmin: boolean;
}

export const useEnhancedTrainerVerification = (trainerId?: string) => {
  const { user } = useAuth();
  const targetTrainerId = trainerId || user?.id;
  const queryClient = useQueryClient();
  
  // Use cached admin role check
  const { data: roles } = useUserRolesData();
  const isAdminUser = roles?.some(r => r.role === 'admin') ?? false;

  // Single composite query for all verification data
  const { data, isLoading, refetch } = useQuery<VerificationData>({
    queryKey: ['trainer-verification', targetTrainerId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching verification data for trainer:', targetTrainerId);

      // Parallel fetch all data
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

      // Handle checks data  
      if (checksResult.error) throw checksResult.error;

      // Handle audit log data
      if ('error' in auditResult && auditResult.error) throw auditResult.error;

      return {
        overview: overviewResult.data,
        checks: checksResult.data || [],
        auditLog: auditResult.data || [],
        isAdmin: isAdminUser,
      };
    },
    enabled: !!targetTrainerId && !!user,
    staleTime: queryConfig.verification.staleTime,
    gcTime: queryConfig.verification.gcTime,
    refetchOnMount: queryConfig.verification.refetchOnMount,
    refetchOnWindowFocus: queryConfig.verification.refetchOnWindowFocus,
    refetchOnReconnect: queryConfig.verification.refetchOnReconnect,
  });

  // Update verification preference toggle
  const updateDisplayPreferenceMutation = useMutation({
    mutationFn: async (preference: 'verified_allowed' | 'hidden') => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('trainer_verification_overview')
        .upsert({
          trainer_id: user.id,
          display_preference: preference,
        }, {
          onConflict: 'trainer_id'
        });

      if (error) throw error;
      return preference;
    },
    onSuccess: (preference) => {
      queryClient.invalidateQueries({ queryKey: ['trainer-verification', targetTrainerId] });
      toast.success(`Verification badge ${preference === 'verified_allowed' ? 'enabled' : 'disabled'}`);
    },
    onError: (error) => {
      console.error('Error updating display preference:', error);
      toast.error('Failed to update preference');
    },
  });

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
        'trainer-verification-documents',
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
  const submitVerificationCheckMutation = useMutation({
    mutationFn: async ({
      checkType,
      checkData,
      isDraft = false,
      suppressToast = false,
    }: {
      checkType: string;
      checkData: any;
      isDraft?: boolean;
      suppressToast?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const existingCheck = data?.checks.find(c => c.check_type === checkType);
      const isResubmission = existingCheck && existingCheck.status === 'rejected';
      const isInitialSubmission = !existingCheck;
      
      // If resubmitting after rejection, preserve audit trail
      if (isResubmission) {
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

      if (!isDraft) {
        submitData.status = checkData.not_applicable ? 'not_applicable' : 'pending';
        submitData.submitted_at = new Date().toISOString();
      }

      // Add optional fields
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
        if (!fileUrl) throw new Error('Failed to upload document');
        submitData.evidence_file_url = fileUrl;
        submitData.evidence_metadata = {
          filename: checkData.file.name,
          size: checkData.file.size,
          type: checkData.file.type,
        };
      }

      const { data: responseData, error } = await supabase
        .from('trainer_verification_checks')
        .upsert(submitData, {
          onConflict: 'trainer_id,check_type'
        })
        .select()
        .single();

      if (error) throw new Error(`Database error: ${error.message}`);
      if (!responseData) throw new Error('No data returned from database after upsert');

      // Create audit log entry
      if (isInitialSubmission || !isResubmission) {
        await supabase
          .from('trainer_verification_audit_log')
          .insert({
            trainer_id: user.id,
            check_id: responseData.id,
            actor: 'trainer',
            action: 'upload',
            previous_status: existingCheck?.status || null,
            new_status: responseData.status,
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

      return { isDraft, suppressToast };
    },
    onSuccess: ({ isDraft, suppressToast }) => {
      queryClient.invalidateQueries({ queryKey: ['trainer-verification', targetTrainerId] });
      if (!isDraft && !suppressToast) {
        toast.success('Verification check submitted successfully!');
      }
    },
    onError: (error: Error) => {
      console.error('Error submitting verification:', error);
      toast.error(`Submission failed: ${error.message}`);
    },
  });

  // Admin function to update verification check status
  const adminUpdateCheckMutation = useMutation({
    mutationFn: async ({
      checkId,
      status,
      adminNotes,
      rejectionReason,
    }: {
      checkId: string;
      status: VerificationCheck['status'];
      adminNotes?: string;
      rejectionReason?: string;
    }) => {
      if (!data?.isAdmin) throw new Error('Admin privileges required');

      const { error } = await supabase.rpc('admin_update_verification_check', {
        p_check_id: checkId,
        p_status: status,
        p_admin_notes: adminNotes || null,
        p_rejection_reason: rejectionReason || null,
      });

      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ['trainer-verification', targetTrainerId] });
      toast.success(`Verification check ${status === 'verified' ? 'approved' : status}`);
    },
    onError: (error: Error) => {
      console.error('Error updating verification check:', error);
      toast.error(`Failed to update verification check: ${error.message}`);
    },
  });

  // Helper functions
  const getCheckByType = useCallback((type: VerificationCheck['check_type']) => {
    return data?.checks.find(check => check.check_type === type);
  }, [data?.checks]);

  const getVerificationBadgeStatus = useCallback(() => {
    if (!data?.overview) return 'hidden';
    
    return data.overview.overall_status === 'verified' && data.overview.display_preference === 'verified_allowed' 
      ? 'verified' 
      : 'hidden';
  }, [data?.overview]);

  const isExpiringWithin14Days = useCallback((expiryDate?: string) => {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(today.getDate() + 14);
    
    return expiry <= fourteenDaysFromNow && expiry >= today;
  }, []);

  return {
    loading: isLoading,
    overview: data?.overview ?? null,
    checks: data?.checks ?? [],
    auditLog: data?.auditLog ?? [],
    isAdmin: data?.isAdmin ?? false,
    fetchVerificationData: refetch,
    updateDisplayPreference: updateDisplayPreferenceMutation.mutateAsync,
    submitVerificationCheck: submitVerificationCheckMutation.mutateAsync,
    uploadDocument,
    adminUpdateCheck: adminUpdateCheckMutation.mutateAsync,
    getCheckByType,
    getVerificationBadgeStatus,
    isExpiringWithin14Days,
  };
};
