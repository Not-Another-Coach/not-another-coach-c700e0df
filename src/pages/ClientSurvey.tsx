import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUserTypeChecks } from "@/hooks/useUserType";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { useDataMigration } from "@/hooks/useDataMigration";
import { useToast } from "@/hooks/use-toast";
import { ClientCustomHeader } from "@/components/layout/ClientCustomHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, CheckCircle, AlertCircle, Target, MapPin, Calendar, Users, User, Heart, Package, DollarSign, Clock, Loader2 } from "lucide-react";

// Import survey sections
import { GoalsSection } from "@/components/client-survey/GoalsSection";
import { TrainingLocationSection } from "@/components/client-survey/TrainingLocationSection";
import { SchedulingSection } from "@/components/client-survey/SchedulingSection";
import { CoachingStyleSection } from "@/components/client-survey/CoachingStyleSection";
import { PersonalitySection } from "@/components/client-survey/PersonalitySection";
import { LifestyleHealthSection } from "@/components/client-survey/LifestyleHealthSection";
import { PackagePreferencesSection } from "@/components/client-survey/PackagePreferencesSection";
import { BudgetSection } from "@/components/client-survey/BudgetSection";
import { AvailabilitySection } from "@/components/client-survey/AvailabilitySection";
import { MigrationLoader } from "@/components/ui/migration-loader";

const ClientSurvey = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useClientProfile();
  const { isClient } = useUserTypeChecks();
  const { session: anonymousSession } = useAnonymousSession();
  const { isMigrating, migrationCompleted, migrationState, migrationProgress, migrationMessage } = useDataMigration();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track initialization to prevent preferences from being wiped
  const hasInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);
  

  const [formData, setFormData] = useState({
    // Goals and preferences
    primary_goals: [] as string[],
    secondary_goals: [] as string[],
    
    // Training location and format
    training_location_preference: null as string | null,
    open_to_virtual_coaching: false,
    
    // Training frequency and scheduling
    preferred_training_frequency: null as number | null,
    preferred_time_slots: [] as string[],
    start_timeline: null as string | null,
    
    // Coaching style preferences
    preferred_coaching_style: [] as string[],
    motivation_factors: [] as string[],
    
    // Client self-description
    client_personality_type: [] as string[],
    experience_level: "beginner" as string,
    
    // Lifestyle and health
    location: null as string | null,
    fitness_equipment_access: [] as string[],
    lifestyle_description: [] as string[],
    lifestyle_other: null as string | null,
    health_conditions: null as string | null,
    has_specific_event: null as string | null,
    specific_event_details: null as string | null,
    specific_event_date: null as Date | null,
    
    // Package and budget preferences
    preferred_package_type: null as string | null,
    budget_range_min: null as number | null,
    budget_range_max: null as number | null,
    budget_flexibility: "flexible" as string,
    
    // Waitlist and availability preferences
    waitlist_preference: null as boolean | null,
    flexible_scheduling: false,
    
    // Survey completion tracking
    client_survey_completed: false,
  });

  const totalSteps = 9;

  const stepTitles = [
    "Your Goals",
    "Training Location",
    "Training Schedule", 
    "Coaching Style",
    "About You",
    "Lifestyle & Health",
    "Package Preferences",
    "Budget Range",
    "Availability & Start Date"
  ];

  const stepIcons = [
    Target,        // Your Goals
    MapPin,        // Training Location  
    Calendar,      // Scheduling Preferences
    Users,         // Coaching Style
    User,          // About You
    Heart,         // Lifestyle & Health
    Package,       // Package Preferences
    DollarSign,    // Budget Range
    Clock          // Availability & Start Date
  ];

  // Redirect if not client or if survey is already completed
  useEffect(() => {
    // Wait for all loading to complete before making navigation decisions
    if (loading || profileLoading) {
      return;
    }

    // If not logged in, redirect to auth
    if (!user) {
      navigate('/auth');
      return;
    }

    // If we have user but no profile yet, wait for profile to load
    if (!profile) {
      return;
    }

    // Check if user is a client
    if (!isClient()) {
      navigate('/');
      return;
    }
    
    // Allow users to access this page even after completion to edit their preferences
    // Only redirect to dashboard if they explicitly complete the survey flow
  }, [user, profile, loading, profileLoading, navigate, isClient]);

  // Reset initialization flag when user changes
  useEffect(() => {
    if (user?.id !== lastUserId.current) {
      hasInitialized.current = false;
      lastUserId.current = user?.id || null;
    }
  }, [user?.id]);

  // Initialize form data from profile and anonymous session
  // More resilient initialization that handles migration states better
  useEffect(() => {
    console.log('🔄 Form initialization check:', {
      hasProfile: !!profile?.id,
      isMigrating,
      migrationCompleted,
      hasInitialized: hasInitialized.current,
      profileGoalsLength: profile?.primary_goals?.length || 0
    });

    // Initialize when we have a profile and either migration is done OR we're not migrating
    // Add small delay after migration completion to ensure smooth transition
    if (profile && profile.id && (migrationCompleted || migrationState === 'completed' || !isMigrating) && !hasInitialized.current) {
      // Add slight delay after migration to ensure smooth UI transition
      const initDelay = migrationCompleted && migrationState === 'completed' ? 500 : 0;
      
      setTimeout(() => {
        hasInitialized.current = true;
        console.log('✅ Initializing form with profile data');
        
        // Start with profile data - use comprehensive mapping
        const initialData = {
          primary_goals: profile.primary_goals || [],
          secondary_goals: profile.secondary_goals || [],
          training_location_preference: profile.training_location_preference || null,
          open_to_virtual_coaching: profile.open_to_virtual_coaching ?? false,
          preferred_training_frequency: profile.preferred_training_frequency ? parseInt(profile.preferred_training_frequency) : null,
          preferred_time_slots: profile.preferred_time_slots || [],
          start_timeline: profile.start_timeline || null,
          preferred_coaching_style: profile.preferred_coaching_style || [],
          motivation_factors: profile.motivation_factors || [],
          client_personality_type: profile.client_personality_type || [],
          experience_level: profile.experience_level || "beginner",
          location: (profile as any).location || null,
          fitness_equipment_access: (profile as any).fitness_equipment_access || [],
          lifestyle_description: (profile as any).lifestyle_description || [],
          lifestyle_other: (profile as any).lifestyle_other || null,
          health_conditions: (profile as any).health_conditions || null,
          has_specific_event: (profile as any).has_specific_event || null,
          specific_event_details: (profile as any).specific_event_details || null,
          specific_event_date: (profile as any).specific_event_date ? new Date((profile as any).specific_event_date) : null,
          preferred_package_type: profile.preferred_package_type || null,
          budget_range_min: profile.budget_range_min || null,
          budget_range_max: profile.budget_range_max || null,
          budget_flexibility: profile.budget_flexibility || "flexible",
          waitlist_preference: profile.waitlist_preference ?? null,
          flexible_scheduling: profile.flexible_scheduling ?? false,
          client_survey_completed: false,
        };
        
        // Fallback: If profile is empty but we have anonymous session data, use it
        if (anonymousSession?.quizResults && !profile.primary_goals?.length) {
          console.log('📋 Using anonymous session data as fallback');
          const quizResults = anonymousSession.quizResults;
          
          // Map from quiz to form using only properties that exist
          if (quizResults.primary_goals || quizResults.goals) {
            initialData.primary_goals = quizResults.primary_goals || quizResults.goals || [];
          }
          if (quizResults.secondary_goals) {
            initialData.secondary_goals = quizResults.secondary_goals || [];
          }
          if (quizResults.training_location_preference || quizResults.location) {
            initialData.training_location_preference = quizResults.training_location_preference || quizResults.location || null;
          }
          if (quizResults.open_to_virtual_coaching !== undefined) {
            initialData.open_to_virtual_coaching = quizResults.open_to_virtual_coaching || false;
          }
          if (quizResults.preferred_training_frequency || quizResults.availability) {
            const frequencyValue = quizResults.preferred_training_frequency || quizResults.availability || null;
            initialData.preferred_training_frequency = typeof frequencyValue === 'number' ? frequencyValue : 
              (typeof frequencyValue === 'string' ? parseInt(frequencyValue) : null);
          }
          if (quizResults.preferred_time_slots) {
            initialData.preferred_time_slots = quizResults.preferred_time_slots || [];
          }
          if (quizResults.start_timeline) {
            initialData.start_timeline = quizResults.start_timeline || null;
          }
          if (quizResults.preferred_coaching_style || quizResults.coachingStyle) {
            initialData.preferred_coaching_style = quizResults.preferred_coaching_style || quizResults.coachingStyle || [];
          }
          if (quizResults.budget_range_min) {
            initialData.budget_range_min = quizResults.budget_range_min || null;
          }
          if (quizResults.budget_range_max) {
            initialData.budget_range_max = quizResults.budget_range_max || null;
          }
          if (quizResults.budget_flexibility) {
            initialData.budget_flexibility = quizResults.budget_flexibility || "flexible";
          }
        }
        
        console.log('📝 Setting form data:', initialData);
        setFormData(initialData);
        
        // Set current step to continue from where left off, or start from step 1
        setCurrentStep(1);
      }, initDelay);
    }
  }, [profile?.id, migrationCompleted, migrationState, isMigrating, anonymousSession]);

  // Stable update function
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Stable clear error function
  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Validation for each step
  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Goals
        if (!formData.primary_goals || formData.primary_goals.length === 0) {
          newErrors.primary_goals = "Please select at least one primary goal";
        }
        break;
      case 2: // Training Location
        if (!formData.training_location_preference) {
          newErrors.training_location_preference = "Please select your preferred training location";
        }
        break;
      case 3: // Scheduling
        if (!formData.preferred_training_frequency) {
          newErrors.preferred_training_frequency = "Please select how often you want to train";
        }
        if (!formData.preferred_time_slots || formData.preferred_time_slots.length === 0) {
          newErrors.preferred_time_slots = "Please select when you're usually available";
        }
        break;
      case 4: // Coaching Style
        if (!formData.preferred_coaching_style || formData.preferred_coaching_style.length === 0) {
          newErrors.preferred_coaching_style = "Please select at least one coaching style preference";
        }
        break;
      case 5: // About You
        if (!formData.client_personality_type || formData.client_personality_type.length === 0) {
          newErrors.client_personality_type = "Please select at least one that describes you";
        }
        break;
      case 6: // Lifestyle & Health
        if (!formData.location || formData.location.trim() === "") {
          newErrors.location = "Please tell us where you're based";
        }
        if (!formData.fitness_equipment_access || formData.fitness_equipment_access.length === 0) {
          newErrors.fitness_equipment_access = "Please select your equipment access";
        }
        if (!formData.lifestyle_description || formData.lifestyle_description.length === 0) {
          newErrors.lifestyle_description = "Please select at least one lifestyle option";
        }
        if (!formData.has_specific_event) {
          newErrors.has_specific_event = "Please let us know about any specific events or dates";
        }
        break;
      case 7: // Package Preferences
        if (!formData.preferred_package_type) {
          newErrors.preferred_package_type = "Please select your package preference";
        }
        break;
      case 8: // Budget
        // Budget is now mandatory - either quick range or custom range required
        if (!formData.budget_range_min && !formData.budget_range_max) {
          newErrors.budget_range = "Please select a budget range or set custom min/max values";
        }
        break;
      case 9: // Availability
        if (formData.waitlist_preference === null) {
          newErrors.waitlist_preference = "Please select how you'd prefer to handle trainer availability";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStepCompletion = (step: number): 'completed' | 'partial' | 'not_started' => {
    switch (step) {
      case 1:
        return formData.primary_goals?.length > 0 ? 'completed' : 'not_started';
      case 2:
        return formData.training_location_preference ? 'completed' : 'not_started';
      case 3:
        const hasFrequency = formData.preferred_training_frequency;
        const hasTimeSlots = formData.preferred_time_slots?.length > 0;
        return hasFrequency && hasTimeSlots ? 'completed' : (hasFrequency || hasTimeSlots ? 'partial' : 'not_started');
      case 4:
        return formData.preferred_coaching_style?.length > 0 ? 'completed' : 'not_started';
      case 5:
        return formData.client_personality_type?.length > 0 ? 'completed' : 'not_started';
      case 6: // Lifestyle & Health
        const hasLocation = formData.location && formData.location.trim() !== "";
        const hasEquipment = formData.fitness_equipment_access && formData.fitness_equipment_access.length > 0;
        const hasLifestyle = formData.lifestyle_description?.length > 0;
        const hasEventChoice = formData.has_specific_event;
        
        const lifestyleCompletedFields = [hasLocation, hasEquipment, hasLifestyle, hasEventChoice].filter(Boolean).length;
        if (lifestyleCompletedFields === 4) return 'completed';
        if (lifestyleCompletedFields > 0) return 'partial';
        return 'not_started';
      case 7:
        return formData.preferred_package_type ? 'completed' : 'not_started';
      case 8:
        // Budget is mandatory - either min or max must be set
        return (formData.budget_range_min || formData.budget_range_max) ? 'completed' : 'not_started';
      case 9:
        return formData.waitlist_preference !== null ? 'completed' : 'not_started';
      default:
        return 'not_started';
    }
  };

  const handleSave = async (showToast: boolean = true) => {
    try {
      setIsLoading(true);
      
      // Update survey completion without step tracking
      const dataToSave = {
        ...formData,
        // Convert number to string for database compatibility
        preferred_training_frequency: formData.preferred_training_frequency ? String(formData.preferred_training_frequency) : null,
      };
      
      const result = await updateProfile(dataToSave);
      
      if (result && 'error' in result && result.error) {
        throw new Error(result.error.message || 'Failed to save survey');
      }
      
      if (showToast) {
        toast({
          title: "Progress saved",
          description: "Your survey progress has been saved.",
        });
      }
      return result;
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please complete this step",
        description: "Fill in all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await handleSave(false);
      
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        // Scroll to top when moving to next step
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        await updateProfile({ 
          ...formData, 
          preferred_training_frequency: formData.preferred_training_frequency ? String(formData.preferred_training_frequency) : null,
          client_survey_completed: true,
          quiz_completed: true
        });
        
        toast({
          title: "Survey completed!",
          description: "You can now discover and match with trainers.",
        });
        navigate('/client/dashboard', { state: { fromSurvey: true } });
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when moving to previous step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateProgress = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const calculateOverallCompletion = () => {
    let completedSteps = 0;
    for (let i = 1; i <= totalSteps; i++) {
      if (getStepCompletion(i) === 'completed') {
        completedSteps++;
      }
    }
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const isFullyComplete = () => {
    return calculateOverallCompletion() === 100;
  };

  const renderCurrentSection = () => {
    const commonProps = {
      formData,
      updateFormData,
      errors,
      clearFieldError,
    };

    switch (currentStep) {
      case 1:
        return <GoalsSection {...commonProps} />;
      case 2:
        return <TrainingLocationSection {...commonProps} />;
      case 3:
        return <SchedulingSection {...commonProps} />;
      case 4:
        return <CoachingStyleSection {...commonProps} />;
      case 5:
        return <PersonalitySection {...commonProps} />;
      case 6:
        return <LifestyleHealthSection {...commonProps} />;
      case 7:
        return <PackagePreferencesSection {...commonProps} />;
      case 8:
        return <BudgetSection {...commonProps} />;
      case 9:
        return <AvailabilitySection {...commonProps} />;
      default:
        return null;
    }
  };

  // Comprehensive loading state to prevent flashing
  if (loading || profileLoading || isMigrating || (!profile && user)) {
    // Use enhanced migration loader during migration
    if (isMigrating || migrationState !== 'idle') {
      return (
        <MigrationLoader
          migrationState={migrationState}
          migrationProgress={migrationProgress}
          migrationMessage={migrationMessage}
        />
      );
    }
    
    // Standard loading for other states
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div className="text-lg">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header with Navigation */}
      {profile && (
        <div className="bg-card border-b">
          <ClientCustomHeader
            currentPage="dashboard"
            profile={profile}
            onMessagingOpen={() => {}}
            showJourneyProgress={false}
          />
        </div>
      )}

      {/* Survey Progress & Content */}
      <div className="pb-16 sm:pb-0">
        {/* Progress indicator - only show after header */}
        <div className="bg-card border-b px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {isFullyComplete() ? 'Profile Settings' : 'Find Your Perfect Trainer'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isFullyComplete() 
                  ? 'Manage your fitness preferences' 
                  : 'Tell us about your fitness goals and preferences'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (currentStep === 1) {
                    // Confirm before leaving if survey not complete
                    if (!isFullyComplete() && (formData.primary_goals?.length > 0 || formData.training_location_preference)) {
                      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        navigate('/client/dashboard', { state: { fromSurvey: true } });
                      }
                    } else {
                      navigate('/client/dashboard', { state: { fromSurvey: true } });
                    }
                  } else {
                    handlePrevious();
                  }
                }}
                className="sm:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSave()}>
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save Progress</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - only show if not fully complete */}
      {!isFullyComplete() && (
        <div className="bg-card border-b p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
              <span className="text-sm font-medium whitespace-nowrap">
                {calculateOverallCompletion()}% Complete
              </span>
              <div className="flex-1">
                <Progress value={calculateOverallCompletion()} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                💡 Click any step to jump there
              </p>
            </div>
          
          {/* Step indicators - More mobile friendly */}
          <div className="grid grid-cols-4 sm:flex sm:justify-between gap-2 sm:gap-1 mt-3">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const completion = getStepCompletion(stepNumber);
              const isCurrent = stepNumber === currentStep;
              const StepIcon = stepIcons[index];
              
              let statusColor = 'text-muted-foreground';
              let borderColor = 'border-muted-foreground';
              let bgColor = 'bg-transparent';
              let showIcon = false;
              let isPartial = false;

              if (completion === 'completed') {
                statusColor = 'text-green-600';
                borderColor = 'border-green-600';
                bgColor = 'bg-green-600';
                showIcon = true;
              } else if (completion === 'partial') {
                statusColor = 'text-amber-600';
                borderColor = 'border-amber-600';
                bgColor = 'bg-amber-600';
                showIcon = true;
                isPartial = true;
              } else if (isCurrent) {
                statusColor = 'text-primary';
                borderColor = 'border-primary';
                bgColor = 'bg-primary';
              }
              
                return (
                  <div
                    key={stepNumber}
                    className={`flex flex-col items-center text-xs cursor-pointer transition-all hover:scale-105 ${statusColor} p-1`}
                    onClick={() => {
                      setCurrentStep(stepNumber);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={`Go to step ${stepNumber}: ${title}`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-1 relative ${borderColor} ${
                        completion === 'completed' || completion === 'partial' || isCurrent 
                          ? `${bgColor} text-white`
                          : 'bg-transparent'
                      }`}
                    >
                      {showIcon ? (
                        isPartial ? <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <StepIcon className={cn(
                          "h-3 w-3 sm:h-4 sm:w-4",
                          isCurrent ? "text-white" : ""
                        )} />
                      )}
                    </div>
                    <span className={cn(
                      "text-center text-xs leading-tight max-w-16 sm:max-w-20 hidden sm:block",
                      isCurrent ? "font-bold" : ""
                    )}>
                      {title}
                    </span>
                    <span className={cn(
                      "text-center text-xs leading-tight max-w-16 sm:hidden",
                      isCurrent ? "font-bold" : ""
                    )}>
                      {title.split(' ')[0]}
                    </span>
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step indicators for completed surveys */}
      {isFullyComplete() && (
        <div className="bg-card border-b p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm font-medium text-green-600">✓ Survey Complete</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                Currently editing: {stepTitles[currentStep - 1]}
              </span>
            </div>
            
            {/* Clickable step indicators */}
            <div className="grid grid-cols-4 sm:flex sm:justify-between gap-2 sm:gap-1">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const completion = getStepCompletion(stepNumber);
                const isCurrent = stepNumber === currentStep;
                
                return (
                  <div
                    key={stepNumber}
                    className={`flex flex-col items-center text-xs cursor-pointer transition-all hover:scale-105 ${
                      isCurrent ? 'text-primary' : 'text-green-600'
                    } p-1`}
                    onClick={() => {
                      setCurrentStep(stepNumber);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={`Go to step ${stepNumber}: ${title}`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-1 ${
                        isCurrent 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-green-600 bg-green-600 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        <span className="text-xs sm:text-sm font-bold">{stepNumber}</span>
                      ) : (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </div>
                    <span className={cn(
                      "text-center text-xs leading-tight max-w-16 sm:max-w-20 hidden sm:block",
                      isCurrent ? "font-bold" : ""
                    )}>
                      {title}
                    </span>
                    <span className={cn(
                      "text-center text-xs leading-tight max-w-16 sm:hidden",
                      isCurrent ? "font-bold" : ""
                    )}>
                      {title.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto p-3 sm:p-6 pb-20 sm:pb-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4 sm:pb-6 text-center">
            <div className="flex justify-center mb-2">
              {React.createElement(stepIcons[currentStep - 1], { className: "h-8 w-8 text-primary" })}
            </div>
            <CardTitle className="text-xl sm:text-2xl leading-tight">
              {stepTitles[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {renderCurrentSection()}
          </CardContent>
        </Card>

        {/* Navigation - Fixed bottom on mobile, normal on desktop */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-3 sm:relative sm:bg-transparent sm:border-t-0 sm:p-0 sm:mt-6">
          <div className="flex justify-between max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              size="sm"
              className="sm:size-default"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={isLoading}
              size="sm"
              className="sm:size-default"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">{currentStep === totalSteps ? 'Completing...' : 'Saving...'}</span>
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <CheckCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Complete Survey</span>
                  <span className="sm:hidden">Complete</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="h-4 w-4 sm:ml-2 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSurvey;