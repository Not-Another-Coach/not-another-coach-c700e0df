import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, Eye, CheckCircle, AlertCircle } from "lucide-react";

// Import form sections
import { BasicInfoSection } from "@/components/trainer-setup/BasicInfoSection";
import { QualificationsSection } from "@/components/trainer-setup/QualificationsSection";
import { ExpertiseSection } from "@/components/trainer-setup/ExpertiseSection";
import { ClientFitSection } from "@/components/trainer-setup/ClientFitSection";
import { RatesSection } from "@/components/trainer-setup/RatesSection";
import { TestimonialsSection } from "@/components/trainer-setup/TestimonialsSection";
import { ProfileManagementSection } from "@/components/trainer-setup/ProfileManagementSection";

const TrainerProfileSetup = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, isTrainer, updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasInitialized = useRef(false);

  const [formData, setFormData] = useState({
    // Basic Info
    first_name: "",
    last_name: "",
    tagline: "",
    bio: "",
    profile_photo_url: "",
    
    // Qualifications
    qualifications: [] as string[],
    
    // Expertise & Services
    specializations: [] as string[],
    training_types: [] as string[],
    location: "",
    delivery_format: "hybrid" as "in-person" | "online" | "hybrid",
    
    // Client Fit Preferences
    ideal_client_age_range: "",
    ideal_client_fitness_level: "",
    ideal_client_personality: "",
    training_vibe: "",
    max_clients: null as number | null,
    availability_schedule: {},
    
    // Rates & Discovery Calls
    hourly_rate: null as number | null,
    package_options: [],
    free_discovery_call: false,
    calendar_link: "",
    
    // Testimonials & Case Studies
    testimonials: [],
    
    // Profile Management
    client_status: "open" as "open" | "waitlist" | "paused",
    terms_agreed: false,
  });

  const totalSteps = 7;

  const stepTitles = [
    "Basic Info",
    "Qualifications",
    "Expertise & Services", 
    "Client Fit Preferences",
    "Rates & Discovery Calls",
    "Testimonials & Case Studies",
    "Profile Management"
  ];

  // Redirect if not trainer - using simple check
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && !isTrainer()) {
      navigate('/');
    }
  }, [user, profile, loading, profileLoading, isTrainer, navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Initialize form data from profile - one time only
  useEffect(() => {
    if (profile && profile.id && !hasInitialized.current) {
      hasInitialized.current = true;
      setFormData(prev => ({
        ...prev,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        tagline: profile.tagline || "",
        bio: profile.bio || "",
        profile_photo_url: profile.profile_photo_url || "",
        qualifications: profile.qualifications || [],
        specializations: profile.specializations || [],
        training_types: profile.training_types || [],
        location: profile.location || "",
        hourly_rate: profile.hourly_rate,
        client_status: profile.client_status || "open",
        terms_agreed: profile.terms_agreed || false,
      }));
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

  // Simple validation - no dependencies to avoid loops
  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.first_name) newErrors.first_name = "First name is required";
        if (!formData.last_name) newErrors.last_name = "Last name is required";
        if (!formData.tagline || formData.tagline.length < 10) newErrors.tagline = "Tagline is required (10+ characters)";
        if (!formData.bio || formData.bio.length < 50) newErrors.bio = "Bio is required (50+ characters)";
        break;
      case 2:
        if (!formData.qualifications || formData.qualifications.length === 0) {
          newErrors.qualifications = "At least one qualification is required";
        }
        break;
      case 3:
        if (!formData.specializations || formData.specializations.length === 0) {
          newErrors.specializations = "At least one specialization is required";
        }
        if (!formData.training_types || formData.training_types.length === 0) {
          newErrors.training_types = "At least one training type is required";
        }
        if (formData.delivery_format !== "online" && (!formData.location || formData.location.length < 3)) {
          newErrors.location = "Location is required for in-person training";
        }
        break;
      case 5:
        if (!formData.hourly_rate || formData.hourly_rate <= 0) {
          newErrors.hourly_rate = "Hourly rate is required";
        }
        break;
      case 7:
        if (!formData.terms_agreed) {
          newErrors.terms_agreed = "You must agree to the terms";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStepCompletion = (step: number): 'completed' | 'partial' | 'not_started' => {
    switch (step) {
      case 1:
        const hasBasicInfo = formData.first_name && formData.last_name && formData.tagline && formData.bio;
        return hasBasicInfo ? 'completed' : (formData.first_name || formData.last_name ? 'partial' : 'not_started');
      case 2:
        return formData.qualifications?.length > 0 ? 'completed' : 'not_started';
      case 3:
        const hasExpertise = formData.specializations?.length > 0 && formData.training_types?.length > 0;
        const hasPartialExpertise = formData.specializations?.length > 0 || formData.training_types?.length > 0;
        return hasExpertise ? 'completed' : (hasPartialExpertise ? 'partial' : 'not_started');
      case 4:
        return 'completed'; // Optional step
      case 5:
        return formData.hourly_rate && formData.hourly_rate > 0 ? 'completed' : 'not_started';
      case 6:
        return 'completed'; // Optional step
      case 7:
        return formData.terms_agreed ? 'completed' : 'not_started';
      default:
        return 'not_started';
    }
  };

  const handleSave = async (showToast: boolean = true) => {
    try {
      setIsLoading(true);
      
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined && value !== null)
      );
      
      const result = await updateProfile(cleanedFormData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to save profile');
      }
      
      if (showToast) {
        toast({
          title: "Profile saved",
          description: "Your changes have been saved successfully.",
        });
      }
      return result;
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
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
        title: "Validation Error",
        description: "Please complete all required fields before proceeding.",
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
        await updateProfile({ ...formData, profile_setup_completed: true });
        toast({
          title: "Profile completed!",
          description: "Your trainer profile is now live and visible to clients.",
        });
        navigate('/trainer/dashboard');
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

  const handlePreview = () => {
    toast({
      title: "Preview coming soon",
      description: "Profile preview feature will be available soon.",
    });
  };

  const calculateProgress = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const renderCurrentSection = () => {
    // Create stable props object
    const commonProps = {
      formData,
      updateFormData,
      errors,
      clearFieldError,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoSection {...commonProps} />;
      case 2:
        return <QualificationsSection {...commonProps} />;
      case 3:
        return <ExpertiseSection {...commonProps} />;
      case 4:
        return <ClientFitSection {...commonProps} />;
      case 5:
        return <RatesSection {...commonProps} />;
      case 6:
        return <TestimonialsSection {...commonProps} />;
      case 7:
        return <ProfileManagementSection {...commonProps} />;
      default:
        return null;
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trainer/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold">Profile Setup</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave()}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-b p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-medium">
              {calculateProgress()}% Complete
            </span>
            <div className="flex-1">
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
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
                  className={`flex flex-col items-center text-xs cursor-pointer ${statusColor}`}
                  onClick={() => setCurrentStep(stepNumber)}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 ${borderColor} ${
                      completion === 'completed' || completion === 'partial' || isCurrent 
                        ? `${bgColor} text-white`
                        : 'bg-transparent'
                    }`}
                  >
                    {showIcon ? (
                      isPartial ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className="text-center max-w-20 leading-tight">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {stepTitles[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderCurrentSection()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
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
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {currentStep === totalSteps ? 'Completing...' : 'Saving...'}
              </>
            ) : currentStep === totalSteps ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Profile
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfileSetup;