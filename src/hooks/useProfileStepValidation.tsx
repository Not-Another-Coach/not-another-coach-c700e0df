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
    required: true, 
    minLength: 3, 
    message: 'Location is required' 
  },
  
  // Step 4: Client Fit Preferences
  ideal_client_age_range: { 
    required: true, 
    message: 'Please select an ideal client age range' 
  },
  ideal_client_fitness_level: { 
    required: true, 
    message: 'Please select an ideal client fitness level' 
  },
  training_vibe: { 
    required: true, 
    message: 'Please select a training vibe' 
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
  4: ['ideal_client_age_range', 'ideal_client_fitness_level', 'training_vibe'],
  5: ['hourly_rate'],
  6: [], // Testimonials are optional
  7: ['terms_agreed']
};

export const useProfileStepValidation = () => {
  const validation = useFormValidation(validationRules);

  const validateStep = (formData: any, step: number): boolean => {
    const stepFields = stepFieldMapping[step] || [];
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
      if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        completedFields++;
      }
    });

    if (completedFields === 0) return 'not_started';
    if (completedFields === totalFields) return 'completed';
    return 'partial';
  };

  const isStepValid = (formData: any, step: number): boolean => {
    const stepFields = stepFieldMapping[step] || [];
    return stepFields.every(field => {
      const error = validation.validateField(field, formData[field]);
      return !error;
    });
  };

  return {
    ...validation,
    validateStep,
    getStepCompletion,
    isStepValid,
    stepFieldMapping
  };
};