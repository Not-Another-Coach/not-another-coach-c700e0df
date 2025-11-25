import { useState, useEffect } from 'react';
import { useEnhancedTrainerVerification } from './useEnhancedTrainerVerification';
import { useAuth } from './useAuth';
import { useTrainerProfileContext } from '@/contexts/TrainerProfileContext';

interface DocumentFormData {
  provider?: string;
  member_id?: string;
  certificate_id?: string;
  policy_number?: string;
  coverage_amount?: number;
  issue_date?: string;
  expiry_date?: string;
  file?: File;
  not_applicable?: boolean;
}

export const useProfessionalDocumentsState = (profileDocumentNotApplicable?: any) => {
  const { checks, submitVerificationCheck } = useEnhancedTrainerVerification();
  const { user } = useAuth();
  const { updateProfile } = useTrainerProfileContext();
  const [formData, setFormData] = useState<Record<string, DocumentFormData>>({});
  const [notApplicable, setNotApplicable] = useState<Record<string, boolean>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({});

  // Initialize not_applicable flags from profile database, then checks, then localStorage
  useEffect(() => {
    const flags: Record<string, boolean> = {};
    
    // First, load from profile database
    if (profileDocumentNotApplicable && typeof profileDocumentNotApplicable === 'object') {
      Object.assign(flags, profileDocumentNotApplicable);
    }
    
    // Then merge from checks
    if (checks) {
      checks.forEach((check: any) => {
        if (check?.status === 'not_applicable') {
          flags[check.check_type] = true;
        }
      });
    }

    // Finally merge from localStorage (fallback)
    try {
      const key = user?.id ? `verification_not_applicable_${user.id}` : null;
      if (key) {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(flags, parsed);
        }
      }
    } catch {}

    if (Object.keys(flags).length > 0) {
      setNotApplicable(prev => ({ ...prev, ...flags }));
    }
  }, [checks, user?.id, profileDocumentNotApplicable]);


  // Create form state that can be accessed by validation
  const getDocumentsState = () => {
    return {
      verification_data: formData,
      verification_not_applicable: notApplicable,
      verification_checks: checks.reduce((acc, check) => ({
        ...acc,
        [check.check_type]: check
      }), {})
    };
  };

  const updateFormData = (checkType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [checkType]: {
        ...prev[checkType],
        [field]: value,
      },
    }));
  };

  const updateNotApplicable = async (checkType: string, isNotApplicable: boolean) => {
    const updated = { ...notApplicable, [checkType]: isNotApplicable };
    setNotApplicable(updated);
    
    // Persist locally per-user so it's remembered
    try {
      if (user?.id) {
        localStorage.setItem(
          `verification_not_applicable_${user.id}`,
          JSON.stringify(updated)
        );
      }
    } catch {}
    
    // Reflect in local form data immediately
    setFormData(prev => ({
      ...prev,
      [checkType]: { ...(prev[checkType] || {}), not_applicable: isNotApplicable },
    }));

    // Save to database with proper error handling
    try {
      if (updateProfile) {
        console.log('💾 Saving document_not_applicable to database:', updated);
        const result = await updateProfile({ document_not_applicable: updated });
        if (result?.error) {
          console.error('Database update error:', result.error);
          throw new Error('Failed to save preference to database');
        }
        console.log('✅ Successfully saved document_not_applicable to database');
      } else {
        console.warn('⚠️ updateProfile function not available');
      }
    } catch (error) {
      console.error('❌ Error saving document_not_applicable to database:', error);
      // Re-throw to let caller handle the error (e.g., show toast)
      throw error;
    }
  };

  const isAnyFieldFilled = (checkType: string): boolean => {
    const data = formData[checkType];
    if (!data) return false;
    
    const fieldsToCheck = ['provider', 'member_id', 'certificate_id', 'policy_number', 'coverage_amount', 'issue_date', 'expiry_date', 'file'];
    return fieldsToCheck.some(field => {
      const value = data[field as keyof DocumentFormData];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const saveDraft = async (checkType: string) => {
    if (!formData[checkType]) return;
    
    setSavingStatus(prev => ({ ...prev, [checkType]: true }));
    
    try {
      // Save as draft - suppress the default toast since we show our own
      await submitVerificationCheck(checkType as any, formData[checkType], true, true);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSavingStatus(prev => ({ ...prev, [checkType]: false }));
    }
  };

  const submitForReview = async (checkType: string) => {
    if (!formData[checkType]) return;
    
    setSavingStatus(prev => ({ ...prev, [checkType]: true }));
    
    try {
      // Submit for review - sets status to pending, suppress toast since we show our own
      await submitVerificationCheck(checkType as any, formData[checkType], false, true);
      
      // Clear form data after successful submission since it's now stored in the database
      setFormData(prev => ({
        ...prev,
        [checkType]: {}
      }));
      
      // Clear not applicable flag if it was set
      setNotApplicable(prev => ({
        ...prev,
        [checkType]: false
      }));
      
    } catch (error) {
      console.error('Error submitting for review:', error);
      throw error; // Re-throw to let component handle error display
    } finally {
      setSavingStatus(prev => ({ ...prev, [checkType]: false }));
    }
  };

  const getCompletionStatus = () => {
    const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
    
    let completedCount = 0;
    let partialCount = 0;

    // Merge in latest localStorage flags so status reflects most recent selection
    let storedFlags: Record<string, boolean> = {};
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`verification_not_applicable_${user.id}`);
        if (saved) storedFlags = JSON.parse(saved);
      }
    } catch {}
    const effectiveNotApplicable = { ...notApplicable, ...storedFlags };

    console.log('🔍 Prof Documents - Checking completion status');
    console.log('🔍 Prof Documents - Available checks:', checks);
    console.log('🔍 Prof Documents - Not applicable:', effectiveNotApplicable);

    checkTypes.forEach(checkType => {
      const existingCheck = checks.find(check => check.check_type === checkType);
      const isNotApplicableSet = effectiveNotApplicable[checkType];
      const anyFieldFilled = isAnyFieldFilled(checkType);

      console.log(`🔍 Prof Documents - ${checkType}:`, { existingCheck: !!existingCheck, status: existingCheck?.status, isNotApplicableSet, anyFieldFilled });

      // Document is considered completed if:
      // - It's verified or pending (submitted for review)
      // - It's marked as not applicable
      if (existingCheck?.status === 'verified' || 
          existingCheck?.status === 'pending' || 
          isNotApplicableSet) {
        completedCount++;
      } 
      // Document is partial if:
      // - There's form data filled but not submitted
      // - There's an existing check in draft or rejected state
      else if (anyFieldFilled || (existingCheck && ['draft', 'rejected'].includes(existingCheck.status))) {
        partialCount++;
      }
    });

    // IMPORTANT: If all documents are marked as N/A, this section is complete
    const result = completedCount === checkTypes.length ? 'completed' : (partialCount > 0 || completedCount > 0) ? 'partial' : 'not_started';
    console.log('🔍 Prof Documents - Final status:', result, { completedCount, partialCount, totalRequired: checkTypes.length });
    
    return result;
  };

  const canSubmitForReview = () => {
    const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
    
    return checkTypes.every(checkType => {
      const existingCheck = checks.find(check => check.check_type === checkType);
      const isNotApplicableSet = notApplicable[checkType];
      const hasValidDraft = existingCheck && (existingCheck as any)?.draft_status === 'draft';
      
      // Ready if: already submitted/verified, marked not applicable, or has saved draft
      return existingCheck?.status === 'verified' || 
             existingCheck?.status === 'pending' || 
             isNotApplicableSet ||
             hasValidDraft;
    });
  };

  return {
    formData,
    notApplicable,
    savingStatus,
    getDocumentsState,
    updateFormData,
    updateNotApplicable,
    isAnyFieldFilled,
    getCompletionStatus,
    saveDraft,
    submitForReview,
    canSubmitForReview
  };
};