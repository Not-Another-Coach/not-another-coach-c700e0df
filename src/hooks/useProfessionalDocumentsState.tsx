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
  const { checks } = useEnhancedTrainerVerification();
  const [formData, setFormData] = useState<Record<string, DocumentFormData>>({});
  const [notApplicable, setNotApplicable] = useState<Record<string, boolean>>({});

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

  const getCompletionStatus = () => {
    const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
    
    let completedCount = 0;
    let partialCount = 0;

    checkTypes.forEach(checkType => {
      const existingCheck = checks.find(check => check.check_type === checkType);
      const isNotApplicableSet = notApplicable[checkType];
      const anyFieldFilled = isAnyFieldFilled(checkType);

      // Completed if verified, pending, or marked as not applicable
      if (existingCheck?.status === 'verified' || existingCheck?.status === 'pending' || isNotApplicableSet) {
        completedCount++;
      } else if (anyFieldFilled) {
        partialCount++;
      }
    });

    if (completedCount === checkTypes.length) return 'completed';
    if (partialCount > 0 || completedCount > 0) return 'partial';
    return 'not_started';
  };

  return {
    formData,
    notApplicable,
    getDocumentsState,
    updateFormData,
    updateNotApplicable,
    isAnyFieldFilled,
    getCompletionStatus
  };
};