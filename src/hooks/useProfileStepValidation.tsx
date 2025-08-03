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
  coaching_styles: { 
    required: true, 
    custom: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one coaching style is required' 
  },
  
  // Step 5: Rates & Discovery Calls
  hourly_rate: { 
    required: true, 
    custom: (value) => value > 0,
    message: 'Hourly rate is required and must be greater than 0' 
  },
  
  // Step 7: Profile Management
  terms_agreed: { 
    required: true, 
    custom: (value) => value === true,
    message: 'You must agree to the terms and conditions' 
  }
};

const stepFieldMapping: Record<number, string[]> = {
  1: ['first_name', 'last_name', 'tagline', 'bio'],
  2: ['qualifications'],
  3: ['specializations', 'training_types', 'location'],
  4: ['ideal_client_types', 'coaching_styles'],
  5: ['hourly_rate'],
  6: [], // Testimonials are optional
  7: ['terms_agreed']
};

// Additional fields to ensure they're saved (not validated but tracked for completeness)
const additionalFormFields = [
  'profile_photo_url',
  'availability_slots', 
  'max_clients',
  'ideal_client_personality',
  'is_uk_based',
  'works_bank_holidays',
  'free_discovery_call',
  'package_options',
  'testimonials',
  'before_after_photos'
];

export const useProfileStepValidation = () => {
  const validation = useFormValidation(validationRules);

  const validateStep = (formData: any, step: number): boolean => {
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
    
    // Use standard validation for other steps
    return validation.validateStep(formData, stepFields);
  };

  const getStepCompletion = (formData: any, step: number): 'completed' | 'partial' | 'not_started' => {
    const stepFields = stepFieldMapping[step] || [];
    
    if (stepFields.length === 0) {
      return 'completed'; // Steps with no required fields are considered completed
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

  const isStepValid = (formData: any, step: number): boolean => {
    return validateStep(formData, step);
  };

  return {
    ...validation,
    validateStep,
    getStepCompletion,
    isStepValid,
    stepFieldMapping
  };
};