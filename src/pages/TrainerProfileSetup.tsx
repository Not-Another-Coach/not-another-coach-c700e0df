import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { useUserTypeChecks } from "@/hooks/useUserType";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { useTrainerVerification } from "@/hooks/useTrainerVerification";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, Eye, CheckCircle, AlertCircle, Shield, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProfilePreviewModal } from "@/components/trainer-setup/ProfilePreviewModal";
import { CardsView } from "@/components/profile-views/CardsView";

// Import form sections
import { BasicInfoSection } from "@/components/trainer-setup/BasicInfoSection";
import { QualificationsSection } from "@/components/trainer-setup/QualificationsSection";
import { ExpertiseSection } from "@/components/trainer-setup/ExpertiseSection";
import { ClientFitSection } from "@/components/trainer-setup/ClientFitSection";
import { RatesPackagesSection } from "@/components/trainer-setup/RatesPackagesSection";
import { DiscoveryCallSection } from "@/components/trainer-setup/DiscoveryCallSection";
import { TestimonialsSection } from "@/components/trainer-setup/TestimonialsSection";
import { PackageWaysOfWorkingSection } from "@/components/trainer-setup/PackageWaysOfWorkingSection";
import { InstagramIntegration } from "@/components/instagram/InstagramIntegration";
import { ImageManagementSection } from "@/components/trainer-setup/ImageManagementSection";
import { WorkingHoursAndAvailabilitySection } from "@/components/trainer-setup/WorkingHoursAndAvailabilitySection";
import { TermsAndNotificationsSection } from "@/components/trainer-setup/TermsAndNotificationsSection";
import { EnhancedVerificationSection } from "@/components/trainer-setup/EnhancedVerificationSection";

const TrainerProfileSetup = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useTrainerProfile();
  const { isTrainer } = useUserTypeChecks();
  const { packageWorkflows, loading: waysOfWorkingLoading } = usePackageWaysOfWorking();
  const { isConnected: isInstagramConnected } = useInstagramConnection();
  const { verificationRequest } = useTrainerVerification();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingAvailabilityChanges, setPendingAvailabilityChanges] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const hasInitialized = useRef(false);
  const initialFormData = useRef<typeof formData | null>(null);

  const [formData, setFormData] = useState({
    // Basic Info - these exist in TrainerProfile
    first_name: "",
    last_name: "",
    tagline: "",
    bio: "",
    profile_photo_url: "",
    how_started: "",
    philosophy: "",
    professional_milestones: [] as any[],
    profile_image_position: { x: 50, y: 50, scale: 1 },
    
    // Qualifications - these exist in TrainerProfile
    qualifications: [] as string[],
    certificates: [] as any[], // Use certificates to match QualificationsSection
    
    // Expertise & Services - these exist in TrainerProfile
    specializations: [] as string[],
    training_types: [] as string[],
    location: "",
    delivery_format: "hybrid" as string,
    
    // Client Fit Preferences - these exist in TrainerProfile  
    ideal_client_types: [] as string[],
    coaching_style: [] as string[],
    ideal_client_personality: "",
    
    // Rates & Discovery Calls - these exist in TrainerProfile
    hourly_rate: null as number | null,
    package_options: [],
    free_discovery_call: false,
    calendar_link: "",
    
    // Communication Style - this exists in TrainerProfile as string[]
    communication_style: "",
    video_checkins: false,
    messaging_support: false,
    weekly_programming_only: false,
    
    // Testimonials - this exists in TrainerProfile
    testimonials: [],
    
    // Ways of Working - these exist in TrainerProfile
    ways_of_working_onboarding: [],
    ways_of_working_first_week: [],
    ways_of_working_ongoing: [],
    ways_of_working_tracking: [],
    ways_of_working_expectations: [],
    ways_of_working_what_i_bring: [],
    
    // Profile Management - this exists in TrainerProfile
    terms_agreed: false,
    max_clients: null as number | null,
  });

  const totalSteps = 13;

  const stepTitles = [
    "Basic Info",
    "Qualifications",
    "Expertise & Services", 
    "Client Fit Preferences",
    "Rates & Packages",
    "Discovery Calls",
    "Testimonials & Case Studies",
    "Ways of Working",
    "Instagram Integration",
    "Image Management",
    "Working Hours & New Client Availability",
    "T&Cs and Notifications",
    "Verification"
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

  // Initialize form data from profile when available
  useEffect(() => {
    // Only initialize when we have a profile with an ID and haven't initialized yet
    if (profile && profile.id && !hasInitialized.current) {
      hasInitialized.current = true;
      const initialData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        tagline: profile.tagline || "",
        bio: profile.bio || "",
        how_started: profile.how_started || "",
        philosophy: profile.philosophy || "",
        professional_milestones: profile.professional_milestones || [],
        profile_photo_url: profile.profile_photo_url || "",
        profile_image_position: profile.profile_image_position || { x: 50, y: 50, scale: 1 },
        qualifications: Array.isArray(profile.qualifications) ? profile.qualifications : [],
        certificates: profile.uploaded_certificates || [],
        specializations: Array.isArray(profile.specializations) ? profile.specializations : [],
        training_types: Array.isArray(profile.training_types) ? profile.training_types : [],
        location: profile.location || "",
        delivery_format: Array.isArray(profile.delivery_format) ? profile.delivery_format[0] || "hybrid" : profile.delivery_format || "hybrid",
        ideal_client_types: Array.isArray(profile.ideal_client_types) ? profile.ideal_client_types : [],
        coaching_style: Array.isArray(profile.coaching_style) ? profile.coaching_style : [],
        ideal_client_personality: profile.ideal_client_personality || "",
        hourly_rate: profile.hourly_rate || null,
        package_options: profile.package_options || [],
        free_discovery_call: profile.free_discovery_call || false,
        calendar_link: profile.calendar_link || "",
        communication_style: Array.isArray(profile.communication_style) ? profile.communication_style.join(', ') : profile.communication_style || "",
        video_checkins: profile.video_checkins || false,
        messaging_support: profile.messaging_support || false,
        weekly_programming_only: profile.weekly_programming_only || false,
        testimonials: profile.testimonials || [],
        ways_of_working_onboarding: profile.ways_of_working_onboarding || [],
        ways_of_working_first_week: profile.ways_of_working_first_week || [],
        ways_of_working_ongoing: profile.ways_of_working_ongoing || [],
        ways_of_working_tracking: profile.ways_of_working_tracking || [],
        ways_of_working_expectations: profile.ways_of_working_expectations || [],
        ways_of_working_what_i_bring: profile.ways_of_working_what_i_bring || [],
        terms_agreed: profile.terms_agreed || false,
        max_clients: profile.max_clients || null,
      };
      
      setFormData(prev => ({ ...prev, ...initialData }));
      initialFormData.current = { ...initialData };
      setHasUnsavedChanges(false);
    }
  }, [profile]);

  // Reset initialization when component unmounts to ensure fresh data loading on return
  useEffect(() => {
    return () => {
      hasInitialized.current = false;
    };
  }, []);

  // Track changes to form data
  useEffect(() => {
    if (initialFormData.current && hasInitialized.current) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData]);

  // Handle tab navigation from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      const tabMap: Record<string, number> = {
        'basic': 1,
        'qualifications': 2,
        'expertise': 3,
        'client-fit': 4,
        'rates': 5,
        'discovery-calls': 6,
        'testimonials': 7,
        'ways-of-working': 8,
        'instagram': 9,
        'images': 10,
        'working-hours': 11,
        'terms-notifications': 12,
        'verification': 13
      };
      
      const stepNumber = tabMap[tab];
      if (stepNumber && stepNumber !== currentStep) {
        setCurrentStep(stepNumber);
      }
    }
  }, [searchParams]);

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
        if (!formData.package_options || formData.package_options.length === 0) {
          newErrors.package_options = "At least one package is required";
        }
        if (!formData.communication_style || formData.communication_style.trim().length < 20) {
          newErrors.communication_style = "Please describe how you work best with clients (minimum 20 characters)";
        }
        const hasCommunicationMethod = formData.video_checkins || formData.messaging_support || formData.weekly_programming_only;
        if (!hasCommunicationMethod) {
          newErrors.communication_methods = "Please select at least one communication method you offer";
        }
        if (!formData.package_options || formData.package_options.length === 0) {
          newErrors.package_options = "At least one tiered pricing package is required";
        }
        break;
      case 12:
        if (!formData.terms_agreed) {
          newErrors.terms_agreed = "You must agree to the terms";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Weight distribution for each step (total: 100%)
  const getStepWeight = (step: number): number => {
    const weights = {
      1: 15,  // Basic Info (most important)
      2: 12,  // Qualifications (important credibility)
      3: 12,  // Expertise & Services (core offering)
      4: 10,  // Client Fit Preferences (matching algorithm)
      5: 15,  // Rates & Packages (monetization, complex)
      6: 8,   // Discovery Calls (valuable but optional)
      7: 10,  // Ways of Working (client experience)
      8: 5,   // Instagram Integration (optional, lower weight)
      9: 3,   // Image Management (optional, cosmetic)
      10: 3,  // Working Hours (optional)
      11: 5,  // Terms & Notifications (compliance)
      12: 2   // Verification (final step, external dependency)
    };
    return weights[step] || 0;
  };

  const getStepCompletion = (step: number): 'completed' | 'partial' | 'not_started' => {
    switch (step) {
      case 1: // Basic Info - check only fields that exist on this form
        const hasAllBasicInfo = formData.first_name && formData.last_name && 
          formData.tagline && formData.bio;
        const hasPartialBasicInfo = (formData.first_name || formData.last_name || 
          formData.tagline || formData.bio) && 
          Object.values(formData).filter(v => v && v.toString().trim()).length >= 3;
        return hasAllBasicInfo ? 'completed' : (hasPartialBasicInfo ? 'partial' : 'not_started');
        
      case 2: // Qualifications - require 2-3 for completion
        const qualCount = formData.qualifications?.length || 0;
        if (qualCount >= 2) return 'completed';
        if (qualCount >= 1) return 'partial';
        return 'not_started';
        
      case 3: // Expertise - require both specializations and training types
        const hasExpertise = formData.specializations?.length > 0 && formData.training_types?.length > 0;
        const hasPartialExpertise = formData.specializations?.length > 0 || formData.training_types?.length > 0;
        return hasExpertise ? 'completed' : (hasPartialExpertise ? 'partial' : 'not_started');
        
      case 4: // Client Fit - require both client types and coaching styles
        const hasClientTypes = formData.ideal_client_types?.length > 0;
        const hasCoachingStyles = formData.coaching_style?.length > 0;
        const hasAllClientFit = hasClientTypes && hasCoachingStyles;
        const hasPartialClientFit = hasClientTypes || hasCoachingStyles;
        return hasAllClientFit ? 'completed' : (hasPartialClientFit ? 'partial' : 'not_started');
        
      case 5: // Rates & Packages - comprehensive requirements
        const hasPackages = formData.package_options && formData.package_options.length > 0;
        const hasCommunicationStyle = formData.communication_style && formData.communication_style.trim().length >= 50;
        const hasCommunicationMethod = formData.video_checkins || formData.messaging_support || formData.weekly_programming_only;
        const hasAllRateRequirements = hasPackages && hasCommunicationStyle && hasCommunicationMethod;
        const hasPartialRate = hasPackages || (hasCommunicationStyle && hasCommunicationMethod);
        return hasAllRateRequirements ? 'completed' : (hasPartialRate ? 'partial' : 'not_started');
        
      case 6: // Discovery Calls
        const hasDiscoveryCallConfig = formData.free_discovery_call && formData.calendar_link?.trim();
        const hasPartialDiscoveryCall = formData.free_discovery_call || formData.calendar_link?.trim();
        return hasDiscoveryCallConfig ? 'completed' : (hasPartialDiscoveryCall ? 'partial' : 'not_started');
        
      case 7: // Ways of Working
        const packages = formData.package_options || [];
        if (packages.length === 0) return 'not_started';
        
        const allPackagesConfigured = packages.every((pkg: any) => {
          const workflow = packageWorkflows.find(w => w.package_id === pkg.id);
          if (!workflow) return false;
          
          const hasContent = (
            (workflow.onboarding_items?.length || 0) > 0 ||
            (workflow.first_week_items?.length || 0) > 0 ||
            (workflow.ongoing_structure_items?.length || 0) > 0 ||
            (workflow.tracking_tools_items?.length || 0) > 0 ||
            (workflow.client_expectations_items?.length || 0) > 0 ||
            (workflow.what_i_bring_items?.length || 0) > 0
          );
          return hasContent;
        });
        
        const anyPackageConfigured = packages.some((pkg: any) => {
          const workflow = packageWorkflows.find(w => w.package_id === pkg.id);
          return workflow && (
            (workflow.onboarding_items?.length || 0) > 0 ||
            (workflow.first_week_items?.length || 0) > 0 ||
            (workflow.ongoing_structure_items?.length || 0) > 0 ||
            (workflow.tracking_tools_items?.length || 0) > 0 ||
            (workflow.client_expectations_items?.length || 0) > 0 ||
            (workflow.what_i_bring_items?.length || 0) > 0
          );
        });
        
        return allPackagesConfigured ? 'completed' : (anyPackageConfigured ? 'partial' : 'not_started');
        
      case 8: // Instagram Integration
        return isInstagramConnected ? 'completed' : 'not_started';
        
      case 9: // Image Management
        return 'not_started'; // Optional step
        
      case 10: // Working Hours  
        return 'not_started'; // Optional step
        
      case 11: // Terms & Notifications
        return formData.terms_agreed ? 'completed' : 'not_started';
        
      case 12: // Verification
        if (profile?.verification_status === 'verified') return 'completed';
        if (verificationRequest?.status === 'pending' || verificationRequest?.status === 'under_review') return 'partial';
        return 'not_started';
        
      default:
        return 'not_started';
    }
  };

  const handleSave = async (showToast: boolean = true) => {
    try {
      setIsLoading(true);
      
      // Convert form data to match TrainerProfile interface types
      const saveData = {
        ...formData,
        // Convert delivery_format from string to array
        delivery_format: [formData.delivery_format],
        // Convert communication_style from string to array
        communication_style: formData.communication_style.split(',').map(s => s.trim()).filter(s => s),
        // Ensure array fields are properly formatted
        ideal_client_types: formData.ideal_client_types || [],
        coaching_styles: formData.coaching_style || [],
        specializations: formData.specializations || [],
        training_types: formData.training_types || [],
        // Map certificates back to uploaded_certificates for database storage
        uploaded_certificates: formData.certificates || [],
      };
      
      console.log('Saving trainer profile data:', saveData);
      console.log('Client types being saved:', saveData.ideal_client_types);
      console.log('Coaching styles being saved:', saveData.coaching_styles);
      
      const result = await updateProfile(saveData);
      
      if (result && 'error' in result && result.error) {
        throw new Error(result.error.message || 'Failed to save profile');
      }
      
      if (showToast) {
        toast({
          title: "Profile saved",
          description: "Your changes have been saved successfully.",
        });
      }
      
      // Update initial form data and reset unsaved changes flag after successful save
      initialFormData.current = { ...formData };
      setHasUnsavedChanges(false);
      
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

  // Save availability settings to coach_availability_settings table
  const saveAvailabilitySettings = async (status: string, settings: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_availability_settings')
        .upsert({
          coach_id: user.id,
          availability_status: status as 'accepting' | 'waitlist' | 'unavailable',
          next_available_date: settings.next_available_date,
          allow_discovery_calls_on_waitlist: settings.allow_discovery_calls_on_waitlist,
          auto_follow_up_days: settings.auto_follow_up_days,
          waitlist_message: settings.waitlist_message,
        }, {
          onConflict: 'coach_id'
        });

      if (error) {
        console.error('Error updating availability settings:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error saving availability settings:', error);
      return { error };
    }
  };

  const handleAvailabilityChange = (status: string, settings: any) => {
    setPendingAvailabilityChanges({ status, settings });
    setHasUnsavedChanges(true);
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

      // Also save availability settings if there are pending changes
      if (pendingAvailabilityChanges) {
        await saveAvailabilitySettings(
          pendingAvailabilityChanges.status,
          pendingAvailabilityChanges.settings
        );
        setPendingAvailabilityChanges(null);
      }
      
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Step 10 is verification - don't complete profile, just show final message
        if (currentStep === 10) {
          toast({
            title: "Profile Setup Complete!",
            description: "Your profile is ready. Submit for verification to go live.",
          });
        } else {
          // Convert form data for profile completion
          const completionData = {
            ...formData,
            delivery_format: [formData.delivery_format],
            communication_style: formData.communication_style.split(',').map(s => s.trim()).filter(s => s),
            profile_setup_completed: true
          };
          await updateProfile(completionData);
          toast({
            title: "Profile completed!",
            description: "Your trainer profile is now live and visible to clients.",
          });
        }
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

  const handlePreview = async () => {
    try {
      await handleSave(false);
      
      // Also save availability settings if there are pending changes
      if (pendingAvailabilityChanges) {
        await saveAvailabilitySettings(
          pendingAvailabilityChanges.status,
          pendingAvailabilityChanges.settings
        );
        setPendingAvailabilityChanges(null);
      }
      
      setShowPreviewModal(true);
    } catch (error) {
      // Error already handled in handleSave
    }
  };

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      navigate('/trainer/dashboard');
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await handleSave(false);
      
      // Also save availability settings if there are pending changes
      if (pendingAvailabilityChanges) {
        await saveAvailabilitySettings(
          pendingAvailabilityChanges.status,
          pendingAvailabilityChanges.settings
        );
        setPendingAvailabilityChanges(null);
      }
      
      navigate('/trainer/dashboard');
    } catch (error) {
      // Error already handled in handleSave
    }
  };

  const handleDiscardAndExit = () => {
    navigate('/trainer/dashboard');
  };

  const calculateProgress = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const calculateOverallCompletion = () => {
    let totalWeightedCompletion = 0;
    
    for (let i = 1; i <= totalSteps; i++) {
      const stepWeight = getStepWeight(i);
      const stepCompletion = getStepCompletion(i);
      
      if (stepCompletion === 'completed') {
        totalWeightedCompletion += stepWeight;
      } else if (stepCompletion === 'partial') {
        totalWeightedCompletion += stepWeight * 0.5; // 50% weight for partial completion
      }
      // 'not_started' contributes 0
    }
    
    return Math.round(totalWeightedCompletion);
  };

  const isFullyComplete = () => {
    return calculateOverallCompletion() === 100;
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
        return <RatesPackagesSection {...commonProps} />;
      case 6:
        return <DiscoveryCallSection {...commonProps} />;
      case 7:
        return <TestimonialsSection {...commonProps} />;
      case 8:
        return <PackageWaysOfWorkingSection {...commonProps} />;
      case 9:
        return <InstagramIntegration />;
      case 10:
        return <ImageManagementSection {...commonProps} />;
      case 11:
        return <WorkingHoursAndAvailabilitySection 
          {...commonProps} 
          onAvailabilityChange={handleAvailabilityChange}
        />;
      case 12:
        return <TermsAndNotificationsSection {...commonProps} />;
      case 13:
        return <EnhancedVerificationSection />;
      default:
        return null;
    }
  };

  if (loading || profileLoading || waysOfWorkingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                {isFullyComplete() ? 'Profile Management' : 'Profile Setup'}
              </h1>
              {/* Verification Badge */}
              {(() => {
                const verificationStatus = (profile as any)?.verification_status || 'pending';
                if (verificationStatus === 'verified') {
                  return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium whitespace-nowrap">
                      <Shield className="h-3 w-3" />
                      <Check className="h-3 w-3" />
                      Verified
                    </div>
                  );
                } else if (verificationStatus === 'under_review') {
                  return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
                      <Shield className="h-3 w-3" />
                      Under Review
                    </div>
                  );
                } else if (verificationStatus === 'pending') {
                  return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium whitespace-nowrap">
                      <Shield className="h-3 w-3" />
                      Pending
                    </div>
                  );
                } else if (verificationStatus === 'rejected') {
                  return (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium whitespace-nowrap">
                      <Shield className="h-3 w-3" />
                      Rejected
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end sm:justify-start">
            <Button variant="outline" size="sm" onClick={() => handleSave()} className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">{profile?.profile_setup_completed ? 'Update' : 'Save Draft'}</span>
              <span className="xs:hidden">Save</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview} className="flex-1 sm:flex-none">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar - only show if not fully complete */}
      {!isFullyComplete() && (
        <div className="bg-card border-b p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium">
                {calculateOverallCompletion()}% Complete
              </span>
              <div className="flex-1">
                <Progress value={calculateOverallCompletion()} className="h-2" />
              </div>
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4 gap-1 overflow-x-auto scrollbar-hide pb-2">
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
                    className={`flex flex-col items-center text-xs cursor-pointer transition-all hover:scale-105 min-w-fit ${statusColor}`}
                    onClick={() => setCurrentStep(stepNumber)}
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
                        <span className="text-xs sm:text-sm font-medium">{stepNumber}</span>
                      )}
                    </div>
                    <span className="text-center max-w-12 sm:max-w-16 md:max-w-20 leading-tight text-xs sm:text-xs truncate">
                      {title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step indicators for completed profiles */}
      {isFullyComplete() && (
        <div className="bg-card border-b p-4">
          <div className="max-w-4xl mx-auto">
            {/* Clickable step indicators */}
            <div className="flex justify-between gap-1 overflow-x-auto scrollbar-hide pb-2">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const completion = getStepCompletion(stepNumber);
                const isCurrent = stepNumber === currentStep;
                
                return (
                  <div
                    key={stepNumber}
                    className={`flex flex-col items-center text-xs cursor-pointer transition-all hover:scale-105 min-w-fit ${
                      isCurrent ? 'text-primary' : 'text-green-600'
                    }`}
                    onClick={() => setCurrentStep(stepNumber)}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mb-1 ${
                        isCurrent 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-green-600 bg-green-600 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        <span className="text-xs sm:text-sm font-medium">{stepNumber}</span>
                      ) : (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </div>
                    <span className={`text-center max-w-12 sm:max-w-16 md:max-w-20 leading-tight text-xs truncate ${isCurrent ? 'font-bold' : ''}`}>
                      {title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Manage profile settings description when fully complete */}
      {isFullyComplete() && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            Manage your trainer profile settings
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="space-y-6 pt-6">
            {renderCurrentSection()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
           <Button 
            onClick={handleNext}
            disabled={isLoading}
            className={currentStep === 1 ? "ml-auto" : ""}
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

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleDiscardAndExit}>
              Discard Changes
            </Button>
            <AlertDialogAction onClick={handleSaveAndExit}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
          trainer={{
            ...formData,
            id: profile?.id,
            name: `${formData.first_name} ${formData.last_name}`.trim(),
            firstName: formData.first_name,
            lastName: formData.last_name,
            specialties: formData.specializations || [],
            rating: 4.8,
            reviews: 127,
            experience: "Verified Professional",
            location: formData.location || "Location TBD",
            hourlyRate: formData.hourly_rate || 75,
            image: formData.profile_photo_url || "/api/placeholder/150/150",
            profilePhotoUrl: formData.profile_photo_url,
            qualifications: formData.qualifications || [], // Include qualifications for profile views
            certifications: formData.qualifications || [], // For backward compatibility with some views
            description: formData.bio || "Professional fitness trainer dedicated to helping you achieve your goals.",
            availability: "Available",
            trainingType: formData.training_types || ["In-Person", "Online"],
            offers_discovery_call: formData.free_discovery_call || false,
            package_options: formData.package_options || []
          }}
      />
    </div>
  );
};

export default TrainerProfileSetup;