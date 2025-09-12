import { useState, useEffect } from 'react';
import { useEnhancedTrainerVerification } from './useEnhancedTrainerVerification';

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

export const useProfessionalDocumentsState = () => {
  const { checks, submitVerificationCheck } = useEnhancedTrainerVerification();
  const [formData, setFormData] = useState<Record<string, DocumentFormData>>({});
  const [notApplicable, setNotApplicable] = useState<Record<string, boolean>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({});

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

  const updateNotApplicable = (checkType: string, isNotApplicable: boolean) => {
    setNotApplicable(prev => ({
      ...prev,
      [checkType]: isNotApplicable,
    }));
    
    // Clear form data when marking as not applicable
    if (isNotApplicable) {
      setFormData(prev => ({
        ...prev,
        [checkType]: { not_applicable: true },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [checkType]: { not_applicable: false },
      }));
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

    console.log('🔍 Prof Documents - Checking completion status');
    console.log('🔍 Prof Documents - Available checks:', checks);
    console.log('🔍 Prof Documents - Not applicable:', notApplicable);

    checkTypes.forEach(checkType => {
      const existingCheck = checks.find(check => check.check_type === checkType);
      const isNotApplicableSet = notApplicable[checkType];
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

    const result = completedCount === checkTypes.length ? 'completed' : (partialCount > 0 || completedCount > 0) ? 'partial' : 'not_started';
    console.log('🔍 Prof Documents - Final status:', result, { completedCount, partialCount });
    
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