import { useFormValidation, ValidationRules } from './useFormValidation';

const validationRules: ValidationRules = {
  // Step 1: Basic Info
  first_name: { 
    required: true, 
    minLength: 2, 
    message: 'First name is required and must be at least 2 characters' 
  },
  last_name: { 
    required: true, 
    minLength: 2, 
    message: 'Last name is required and must be at least 2 characters' 
  },
  tagline: { 
    required: true, 
    minLength: 10, 
    maxLength: 100, 
    message: 'Tagline is required (10-100 characters)' 
  },
  bio: { 
    required: true, 
    minLength: 50, 
    maxLength: 500, 
    message: 'Bio is required (50-500 characters)' 
  },
  
  // Step 2: Qualifications
  qualifications: { 
    required: true, 
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one qualification is required' 
  },
  
  // Step 3: Expertise & Services
  specializations: { 
    required: true, 
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one specialization is required' 
  },
  training_types: { 
    required: true, 
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one training type is required' 
  },
  location: { 
    required: false, // We'll handle this custom validation in the step validation
    minLength: 3, 
    message: 'Location is required for in-person and hybrid training' 
  },
  
  // Step 4: Client Fit Preferences
  ideal_client_types: { 
    required: true, 
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one ideal client type is required' 
  },
  coaching_style: { 
    required: true, 
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one coaching style is required' 
  },
  
  // Step 5: Rates & Discovery Calls
  package_options: { 
    required: true, 
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one package is required' 
  },
  
  // Step 11: T&Cs and Notifications
  terms_agreed: { 
    required: true, 
    custom: (value) => value === true,
    message: 'You must agree to the terms and conditions' 
  },
  
  // Step 8: Ways of Working
  wow_how_i_work: {
    required: true,
    minLength: 20,
    message: 'How I Work description is required (minimum 20 characters)'
  },
  wow_what_i_provide: {
    required: true,
    minLength: 20,
    message: 'What I Provide description is required (minimum 20 characters)'
  },
  wow_client_expectations: {
    required: true,
    minLength: 20,
    message: 'Client Expectations description is required (minimum 20 characters)'
  },
  wow_activities: {
    required: true,
    custom: (value) => {
      if (!value || typeof value !== 'object') return false;
      const sections = ['wow_how_i_work', 'wow_what_i_provide', 'wow_client_expectations'];
      return sections.some(section => 
        Array.isArray(value[section]) && value[section].length > 0
      );
    },
    message: 'At least one activity must be selected across all Ways of Working sections'
  },
  wow_setup_completed: {
    required: true,
    custom: (value) => value === true,
    message: 'Ways of Working setup must be completed'
  }
};

const stepFieldMapping: Record<number, string[]> = {
  1: ['first_name', 'last_name', 'tagline', 'bio'],
  2: ['qualifications'],
  3: ['specializations', 'training_types', 'location'],
  4: ['ideal_client_types', 'coaching_style'], // Fixed: coaching_style (singular) matches database field
  5: ['package_options'],
  6: [], // Discovery calls - handled separately
  7: [], // Testimonials & Case Studies - handled separately
  8: ['wow_how_i_work', 'wow_what_i_provide', 'wow_client_expectations', 'wow_activities', 'wow_setup_completed'],
  9: [], // Image Management - handled separately
  10: [], // Working Hours & New Client Availability - handled separately
  11: ['terms_agreed'], // T&Cs and Notifications
  12: [], // Professional documents - handled separately
  13: [] // Verification - handled separately
};

// Additional fields to ensure they're saved (not validated but tracked for completeness)
const additionalFormFields = [
  'profile_photo_url',
   
  'max_clients',
  'ideal_client_personality',
  'is_uk_based',
  'works_bank_holidays',
  'free_discovery_call',
  'package_options',
  'testimonials',
  'before_after_photos'
];

// Helper function to check if Ways of Working prerequisites are met
const checkWaysOfWorkingPrerequisites = (formData: any): boolean => {
  // Check if all required text fields have minimum content
  const textFields = ['wow_how_i_work', 'wow_what_i_provide', 'wow_client_expectations'];
  const textFieldsValid = textFields.every(field => 
    formData[field] && formData[field].length >= 20
  );
  
  // Check if at least one activity is selected across all sections
  const activities = formData.wow_activities;
  const activitiesValid = activities && typeof activities === 'object' &&
    ['wow_how_i_work', 'wow_what_i_provide', 'wow_client_expectations'].some(section => 
      Array.isArray(activities[section]) && activities[section].length > 0
    );
  
  return textFieldsValid && activitiesValid;
};

export const useProfileStepValidation = () => {
  const validation = useFormValidation(validationRules);

  const validateStep = (formData: any, step: number): boolean => {
    // Add null check for formData
    if (!formData) {
      return false;
    }
    
    const stepFields = stepFieldMapping[step] || [];
    
    // Special handling for step 3 (Expertise) - location validation depends on delivery format
    if (step === 3) {
      const customValidation = stepFields.every(field => {
        if (field === 'location') {
          // Location is only required for in-person or hybrid delivery
          const deliveryFormat = formData.delivery_format;
          if (deliveryFormat === 'online') {
            return true; // Location not required for online-only
          }
          // For in-person or hybrid, location is required
          return formData.location && formData.location.length >= 3;
        }
        // Use standard validation for other fields
        const error = validation.validateField(field, formData[field]);
        return !error;
      });
      return customValidation;
    }

    // Special handling for steps with no required fields
    if ([6, 7, 9, 10, 13].includes(step)) {
      return true; // These steps are always valid (optional or handled separately)
    }
    
    // Special handling for step 12 (Professional Documents)
    if (step === 12) {
      return validateProfessionalDocuments(formData);
    }
    
    // Use standard validation for other steps
    return validation.validateStep(formData, stepFields);
  };

  const validateProfessionalDocuments = (formData: any): boolean => {
    // Add null check for formData
    if (!formData) {
      return false;
    }
    
    // Professional documents validation: 
    // - If no fields filled and not marked as "not applicable" → valid (optional)
    // - If marked as "not applicable" → valid
    // - If any field is filled → all required fields must be filled
    
    const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
    
    return checkTypes.every(checkType => {
      const data = formData.verification_data?.[checkType];
      const notApplicable = formData.verification_not_applicable?.[checkType];
      
      // If marked as not applicable, it's valid
      if (notApplicable) return true;
      
      // If no data exists, it's valid (optional)
      if (!data) return true;
      
      // Check if any field is filled
      const fieldsFilled = Object.values(data).some(value => value !== undefined && value !== '' && value !== null);
      
      // If no fields are filled, it's valid
      if (!fieldsFilled) return true;
      
      // If some fields are filled, all required fields must be filled
      // This would need to be implemented based on your specific requirements
      // For now, we'll consider it valid if any field is filled (indicating progress)
      return true;
    });
  };

  const getStepCompletion = (formData: any, step: number): 'completed' | 'partial' | 'not_started' => {
    // Add null check for formData
    if (!formData) {
      return 'not_started';
    }
    
    const stepFields = stepFieldMapping[step] || [];
    
    // Special completion logic for specific steps
    if (step === 10) {
      // Working Hours & New Client Availability - check availability_status or availability_schedule
      const hasAvailabilityStatus = formData.availability_status;
      const hasAvailabilitySchedule = formData.availability_schedule && 
        typeof formData.availability_schedule === 'object';
      
      return (hasAvailabilityStatus || hasAvailabilitySchedule) ? 'completed' : 'not_started';
    }
    
    if (step === 12) {
      // Professional Documents - special completion logic
      return getProfessionalDocumentsCompletion(formData);
    }
    
    // Steps 6, 7, 9, 13 have special completion logic - don't auto-complete
    if ([6, 7, 9, 13].includes(step)) {
      // Check if these steps actually have content
      if (step === 6) {
        // Discovery calls - completed when calendar link is set AND discovery calls are offered
        const hasCalendar = typeof formData.calendar_link === 'string' && formData.calendar_link.trim().length > 0;
        const offersDiscovery = formData.free_discovery_call === true;
        if (hasCalendar && offersDiscovery) return 'completed';
        if (hasCalendar || offersDiscovery) return 'partial';
        return 'not_started';
      }
      if (step === 7) {
        // Testimonials - check if any exist
        return (formData.testimonials && formData.testimonials.length > 0) ? 'completed' : 'not_started';
      }
      if (step === 9) {
        // Image Management - check if profile photo exists
        return formData.profile_photo_url ? 'completed' : 'not_started';
      }
      if (step === 13) {
        // Verification - check verification status
        return formData.verification_status === 'verified' ? 'completed' : 'not_started';
      }
    }

    // Step 8 (Ways of Working) - check both completion flag and activities
    if (step === 8) {
      const hasActivities = formData.wow_activities && typeof formData.wow_activities === 'object' &&
        ['wow_how_i_work', 'wow_what_i_provide', 'wow_client_expectations'].some(section => 
          Array.isArray(formData.wow_activities[section]) && formData.wow_activities[section].length > 0
        );
      
      if (formData.wow_setup_completed === true) return 'completed';
      if (hasActivities) return 'partial';
      return 'not_started';
    }

    // If no required fields for this step and no special content, treat as not started
    if (stepFields.length === 0) {
      return 'not_started';
    }

    let completedFields = 0;
    let totalFields = stepFields.length;

    stepFields.forEach(field => {
      const value = formData[field];
      
      // Special handling for location in step 3
      if (step === 3 && field === 'location') {
        const deliveryFormat = formData.delivery_format;
        if (deliveryFormat === 'online') {
          completedFields++; // Consider location completed for online-only
          return;
        }
      }
      
      if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        completedFields++;
      }
    });

    if (completedFields === 0) return 'not_started';
    if (completedFields === totalFields) return 'completed';
    return 'partial';
  };

  const getProfessionalDocumentsCompletion = (formData: any): 'completed' | 'partial' | 'not_started' => {
    // Add null check for formData
    if (!formData) {
      return 'not_started';
    }
    
    const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
    
    let completedCount = 0;
    let partialCount = 0;
    let notStartedCount = 0;

    checkTypes.forEach(checkType => {
      const data = formData.verification_data?.[checkType];
      const notApplicable = formData.verification_not_applicable?.[checkType];
      const existingCheck = formData.verification_checks?.[checkType];

      // If marked as not applicable or verified, it's completed
      if (notApplicable || existingCheck?.status === 'verified') {
        completedCount++;
        return;
      }

      // If under review, it's completed (submitted)
      if (existingCheck?.status === 'pending') {
        completedCount++;
        return;
      }

      // If no data exists, it's not started
      if (!data) {
        notStartedCount++;
        return;
      }

      // Check if any field is filled
      const fieldsFilled = Object.values(data).some(value => value !== undefined && value !== '' && value !== null);
      
      if (fieldsFilled) {
        partialCount++;
      } else {
        notStartedCount++;
      }
    });

    // All documents are handled (completed or not applicable)
    if (completedCount === checkTypes.length) return 'completed';
    
    // At least one document has been started
    if (partialCount > 0 || completedCount > 0) return 'partial';
    
    // No documents have been started
    return 'not_started';
  };

  const isStepValid = (formData: any, step: number): boolean => {
    return validateStep(formData, step);
  };

  return {
    ...validation,
    validateStep,
    getStepCompletion,
    isStepValid,
    stepFieldMapping,
    checkWaysOfWorkingPrerequisites,
    validateProfessionalDocuments,
    getProfessionalDocumentsCompletion
  };
};