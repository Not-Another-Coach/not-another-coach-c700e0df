import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, CheckCircle, AlertCircle } from "lucide-react";

// Import survey sections
import { GoalsSection } from "@/components/client-survey/GoalsSection";
import { TrainingLocationSection } from "@/components/client-survey/TrainingLocationSection";
import { SchedulingSection } from "@/components/client-survey/SchedulingSection";
import { CoachingStyleSection } from "@/components/client-survey/CoachingStyleSection";
import { PersonalitySection } from "@/components/client-survey/PersonalitySection";
import { PackagePreferencesSection } from "@/components/client-survey/PackagePreferencesSection";
import { BudgetSection } from "@/components/client-survey/BudgetSection";
import { AvailabilitySection } from "@/components/client-survey/AvailabilitySection";

interface ClientSurveyWidgetProps {
  profile: any;
}

export function ClientSurveyWidget({ profile }: ClientSurveyWidgetProps) {
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasInitialized = useRef(false);

  const [formData, setFormData] = useState({
    // Goals and preferences
    primary_goals: [] as string[],
    secondary_goals: [] as string[],
    
    // Training location and format
    training_location_preference: "hybrid" as "in-person" | "online" | "hybrid",
    open_to_virtual_coaching: true,
    
    // Training frequency and scheduling
    preferred_training_frequency: null as number | null,
    preferred_time_slots: [] as string[],
    start_timeline: "flexible" as "urgent" | "next_month" | "flexible",
    
    // Coaching style preferences
    preferred_coaching_style: [] as string[],
    motivation_factors: [] as string[],
    
    // Client self-description
    client_personality_type: [] as string[],
    experience_level: "beginner" as "beginner" | "intermediate" | "advanced",
    
    // Package and budget preferences
    preferred_package_type: "ongoing" as "ongoing" | "short_term" | "single_session",
    budget_range_min: null as number | null,
    budget_range_max: null as number | null,
    budget_flexibility: "flexible" as "strict" | "flexible" | "negotiable",
    
    // Waitlist and availability preferences
    waitlist_preference: "quality_over_speed" as "asap" | "quality_over_speed",
    flexible_scheduling: true,
    
    // Survey completion tracking
    client_survey_completed: false,
    client_survey_step: 1,
    total_client_survey_steps: 8,
  });

  const totalSteps = 8;

  const stepTitles = [
    "Your Goals",
    "Training Location",
    "Scheduling Preferences", 
    "Coaching Style",
    "About You",
    "Package Preferences",
    "Budget Range",
    "Availability & Start Date"
  ];

  // Initialize form data from profile - one time only
  useEffect(() => {
    if (profile && profile.id && !hasInitialized.current) {
      hasInitialized.current = true;
      const profileData = profile as any;
      setFormData(prev => ({
        ...prev,
        primary_goals: profileData.primary_goals || [],
        secondary_goals: profileData.secondary_goals || [],
        training_location_preference: profileData.training_location_preference || "hybrid",
        open_to_virtual_coaching: profileData.open_to_virtual_coaching ?? true,
        preferred_training_frequency: profileData.preferred_training_frequency,
        preferred_time_slots: profileData.preferred_time_slots || [],
        start_timeline: profileData.start_timeline || "flexible",
        preferred_coaching_style: profileData.preferred_coaching_style || [],
        motivation_factors: profileData.motivation_factors || [],
        client_personality_type: profileData.client_personality_type || [],
        experience_level: profileData.experience_level || "beginner",
        preferred_package_type: profileData.preferred_package_type || "ongoing",
        budget_range_min: profileData.budget_range_min,
        budget_range_max: profileData.budget_range_max,
        budget_flexibility: profileData.budget_flexibility || "flexible",
        waitlist_preference: profileData.waitlist_preference || "quality_over_speed",
        flexible_scheduling: profileData.flexible_scheduling ?? true,
        client_survey_step: profileData.client_survey_step || 1,
      }));
      
      // Set current step from profile
      if (profileData.client_survey_step) {
        setCurrentStep(profileData.client_survey_step);
      }
    }
  }, [profile?.id]);

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
        if (!formData.preferred_training_frequency || formData.preferred_training_frequency < 1) {
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
      case 6: // Package Preferences
        if (!formData.preferred_package_type) {
          newErrors.preferred_package_type = "Please select your package preference";
        }
        break;
      case 7: // Budget
        // Budget is now mandatory - either quick range or custom range required
        if (!formData.budget_range_min && !formData.budget_range_max) {
          newErrors.budget_range = "Please select a budget range or set custom min/max values";
        }
        break;
      case 8: // Availability
        if (!formData.start_timeline) {
          newErrors.start_timeline = "Please select when you'd like to start";
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
        const hasFrequency = formData.preferred_training_frequency && formData.preferred_training_frequency > 0;
        const hasTimeSlots = formData.preferred_time_slots?.length > 0;
        return hasFrequency && hasTimeSlots ? 'completed' : (hasFrequency || hasTimeSlots ? 'partial' : 'not_started');
      case 4:
        return formData.preferred_coaching_style?.length > 0 ? 'completed' : 'not_started';
      case 5:
        return formData.client_personality_type?.length > 0 ? 'completed' : 'not_started';
      case 6:
        return formData.preferred_package_type ? 'completed' : 'not_started';
      case 7:
        // Budget is mandatory - either min or max must be set
        return (formData.budget_range_min || formData.budget_range_max) ? 'completed' : 'not_started';
      case 8:
        return formData.start_timeline ? 'completed' : 'not_started';
      default:
        return 'not_started';
    }
  };

  const handleSave = async (showToast: boolean = true) => {
    try {
      setIsLoading(true);
      
      // Update survey step
      const dataToSave = {
        ...formData,
        client_survey_step: currentStep,
      };
      
      const result = await updateProfile(dataToSave as any);
      
      if (result.error) {
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
      } else {
        // Complete the survey - update both completion flags
        await updateProfile({ 
          ...formData, 
          client_survey_completed: true,
          quiz_completed: true,
          client_survey_step: totalSteps
        } as any);
        
        toast({
          title: "Survey completed!",
          description: "Your preferences have been updated.",
        });
        
        // Navigate to dashboard after completing survey
        navigate('/client/dashboard');
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
        return <PackagePreferencesSection {...commonProps} />;
      case 7:
        return <BudgetSection {...commonProps} />;
      case 8:
        return <AvailabilitySection {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold">
            {isFullyComplete() ? 'Update Your Preferences' : 'Complete Your Preferences'}
          </h1>
          <p className="text-muted-foreground">
            {isFullyComplete() 
              ? 'Edit your training preferences to improve your matches' 
              : `Step ${currentStep} of ${totalSteps}: ${stepTitles[currentStep - 1]}`
            }
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleSave()}>
          <Save className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">
            {profile?.client_survey_completed ? "Update/Save" : "Save Progress"}
          </span>
        </Button>
      </div>

      {/* Progress Bar - only show if not fully complete */}
      {!isFullyComplete() && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm font-medium whitespace-nowrap">
                {calculateOverallCompletion()}% Complete
              </span>
              <div className="flex-1">
                <Progress value={calculateOverallCompletion()} className="h-2" />
              </div>
            </div>
            
            {/* Step indicators - More mobile friendly */}
            <div className="grid grid-cols-4 sm:flex sm:justify-between gap-2 sm:gap-1 mt-3">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const completion = getStepCompletion(stepNumber);
                const isCurrent = stepNumber === currentStep;
                
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
                    className={`flex flex-col items-center text-xs cursor-pointer transition-all hover:scale-105 ${statusColor} p-1 relative`}
                    onClick={() => setCurrentStep(stepNumber)}
                    title={`Go to step ${stepNumber}: ${title}`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-1 ${borderColor} ${
                        completion === 'completed' || completion === 'partial' || isCurrent 
                          ? `${bgColor} text-white`
                          : 'bg-transparent'
                      }`}
                    >
                      {showIcon ? (
                        isPartial ? <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <span className={cn(
                          "text-xs sm:text-sm font-medium",
                          isCurrent ? "font-bold" : ""
                        )}>{stepNumber}</span>
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
          </CardContent>
        </Card>
      )}

      {/* Step indicators for completed surveys */}
      {isFullyComplete() && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm font-medium text-green-600">✓ Preferences Complete</span>
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
                    onClick={() => setCurrentStep(stepNumber)}
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
          </CardContent>
        </Card>
      )}

      {/* Current Section */}
      <Card>
        <CardContent className="p-6">
          {renderCurrentSection()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            "Saving..."
          ) : currentStep === totalSteps ? (
            "Complete Survey"
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}