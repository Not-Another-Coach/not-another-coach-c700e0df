import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTrainerProfileContext } from "@/contexts/TrainerProfileContext";
import { useUserTypeChecks, useUserType } from "@/hooks/useUserType";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useEnhancedTrainerVerification } from "@/hooks/useEnhancedTrainerVerification";
import { useDiscoveryCallSettings } from "@/hooks/useDiscoveryCallSettings";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { useTrainerImages } from "@/hooks/useTrainerImages";
import { useProfessionalDocumentsState } from "@/hooks/useProfessionalDocumentsState";
import { useToast } from "@/hooks/use-toast";
import { useProfileStepValidation } from "@/hooks/useProfileStepValidation";
import { useAppSettingsData } from "@/hooks/data/useAppSettingsData";
import { useStatusFeedback } from "@/hooks/useStatusFeedback";
import { InlineStatusBar } from "@/components/ui/inline-status-bar";
import { MilestoneModal } from "@/components/ui/milestone-modal";
import { StatusFeedbackProvider } from "@/contexts/StatusFeedbackContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Save, Eye, ExternalLink, CheckCircle, AlertCircle, Shield, Check, Info } from "lucide-react";
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
import { ResponsiveBreadcrumb, BreadcrumbItem } from "@/components/ui/responsive-breadcrumb";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { ProfileLoadingState } from "@/components/ui/profile-loading-state";
import { AppLogo } from "@/components/ui/app-logo";

// Import form sections
import { BasicInfoSection } from "@/components/trainer-setup/BasicInfoSection";
import { QualificationsSection } from "@/components/trainer-setup/QualificationsSection";
import { ExpertiseSection } from "@/components/trainer-setup/ExpertiseSection";
import { ClientFitSection } from "@/components/trainer-setup/ClientFitSection";
import { RatesPackagesSection } from "@/components/trainer-setup/RatesPackagesSection";
import { DiscoveryCallSection } from "@/components/trainer-setup/DiscoveryCallSection";
import { TestimonialsSection } from "@/components/trainer-setup/TestimonialsSection";
import { SimplifiedWaysOfWorkingSection } from "@/components/trainer-setup/SimplifiedWaysOfWorkingSection";

import { ImageManagementSection } from "@/components/trainer-setup/ImageManagementSection";
import { WorkingHoursAndAvailabilitySection } from "@/components/trainer-setup/WorkingHoursAndAvailabilitySection";
import { TermsAndNotificationsSection } from "@/components/trainer-setup/TermsAndNotificationsSection";
import { ProfileSummarySection } from "@/components/trainer-setup/ProfileSummarySection";
import { ProfessionalDocumentsSection } from "@/components/trainer-setup/ProfessionalDocumentsSection";
import { VerificationPreferenceSection } from "@/components/trainer-setup/VerificationPreferenceSection";
import { PublishButton } from "@/components/trainer-setup/PublishButton";

const TrainerProfileSetup = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useTrainerProfileContext();
  const { isTrainer } = useUserTypeChecks();
  const { loading: userTypeLoading } = useUserType();
  const { packageWorkflows, loading: waysOfWorkingLoading } = usePackageWaysOfWorking();
  const { getCheckByType, loading: verificationLoading, overview } = useEnhancedTrainerVerification();
  const { settings: discoverySettings } = useDiscoveryCallSettings();
  const { settings: availabilitySettings, refetch: refetchAvailability } = useCoachAvailability();
  const { getStepCompletion: getValidationStepCompletion } = useProfileStepValidation();
  const { getSelectedImagesCount, imagePreferences, getValidationStatus } = useTrainerImages();
  const { getCompletionStatus: getProfDocumentsStatus, notApplicable } = useProfessionalDocumentsState(profile?.document_not_applicable);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Combine critical loading states to show skeleton
  const isCriticalDataLoading = loading || profileLoading || verificationLoading;
  const [showContent, setShowContent] = useState(false);

  // Fetch trainer access settings using data hook
  const { data: accessSettingsData } = useAppSettingsData('platform_access_control');
  const trainerAccessEnabled = accessSettingsData?.setting_value?.trainer_access_enabled !== false;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingAvailabilityChanges, setPendingAvailabilityChanges] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false); // Track if form is fully initialized
  const [validationShake, setValidationShake] = useState(false);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set()); // Track changed fields
  const hasInitialized = useRef(false);
  const hasLoadedOnce = useRef(false);
  const initialFormData = useRef<typeof formData | null>(null);
  
  // Premium feedback system
  const { status, hideStatus, showSuccess, showError, showWarning } = useStatusFeedback();

  const [formData, setFormData] = useState({
    // Basic Info - these exist in TrainerProfile
    first_name: "",
    last_name: "",
    gender: "",
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
    training_type_delivery: {},
    location: "",
    delivery_format: "hybrid" as string,
    
    // Client Fit Preferences - these exist in TrainerProfile  
    ideal_client_types: [] as string[],
    coaching_style: [] as string[],
    ideal_client_personality: "",
    preferred_client_genders: ["all"] as string[],
    preferred_client_experience_levels: [] as string[],
    
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
    
    // New activity-centric Ways of Working fields
    wow_how_i_work: "",
    wow_what_i_provide: "",
    wow_client_expectations: "",
    wow_activities: {
      wow_how_i_work: [],
      wow_what_i_provide: [],
      wow_client_expectations: []
    },
    wow_activity_assignments: [],
    wow_visibility: "public",
    wow_setup_completed: false,
    
  // Profile Management - this exists in TrainerProfile
  terms_agreed: false,
  accuracy_confirmed: false,
  notify_profile_views: false,
  notify_messages: true,
  notify_insights: true,
    max_clients: null as number | null,
  });

  const totalSteps = 14;

  const stepTitles = [
    "Basic Info",
    "Qualifications",
    "Expertise & Services", 
    "Client Fit Preferences",
    "Rates & Packages",
    "Discovery Calls",
    "Testimonials & Case Studies",
    "Ways of Working",
    "Image Management",
    "Working Hours & New Client Availability",
    "T&Cs and Notifications",
    "Verification Preference",
    "Professional Documents",
    "Profile Summary"
  ];

  // Redirect if not trainer or not logged in - only after all data is loaded
  useEffect(() => {
    const cameFromHolding = location.state?.fromHolding === true;
    
    // If user came from holding page, they're already authenticated - skip all redirect checks
    if (cameFromHolding) return;
    
    // Wait for all loading to complete before checking redirects
    if (loading || profileLoading || userTypeLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user && profile && !isTrainer()) {
      navigate('/');
    }
  }, [user, profile, loading, profileLoading, userTypeLoading, isTrainer, navigate]);

  // Stable loading check - wait 300ms minimum, then show content when data ready
  useEffect(() => {
    // Once content has been shown, never go back to loading state
    if (hasLoadedOnce.current) {
      setShowContent(true);
      return;
    }
    
    const minLoadTimer = setTimeout(() => {
      // Only mark as loaded if we actually have profile data
      if (!isCriticalDataLoading && profile) {
        hasLoadedOnce.current = true;
        setShowContent(true);
      }
    }, 300);

    return () => clearTimeout(minLoadTimer);
  }, [isCriticalDataLoading, profile]);

  // Fallback: Show content after max 3s regardless of loading state
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!hasLoadedOnce.current) {
        console.warn('Profile loading fallback triggered - showing content despite loading state');
        hasLoadedOnce.current = true;
        setShowContent(true);
      }
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Initialize form data from profile when available
  useEffect(() => {
    // Only initialize when we have a profile with an ID and haven't initialized yet
    if (profile && profile.id && !hasInitialized.current) {
      hasInitialized.current = true;
      
      console.log('✅ INIT: Form data being initialized from profile:', {
        profile_id: profile.id,
        first_name: profile.first_name,
        accuracy_confirmed: profile.accuracy_confirmed,
        terms_agreed: profile.terms_agreed,
        notify_profile_views: profile.notify_profile_views,
        notify_messages: profile.notify_messages,
        notify_insights: profile.notify_insights
      });
        
      const initialData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        gender: profile.gender || "",
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
        training_type_delivery: profile.training_type_delivery || {},
        location: profile.location || "",
        delivery_format: Array.isArray(profile.delivery_format) ? profile.delivery_format[0] || "hybrid" : profile.delivery_format || "hybrid",
        ideal_client_types: Array.isArray(profile.ideal_client_types) ? profile.ideal_client_types : [],
        coaching_style: Array.isArray(profile.coaching_style) ? profile.coaching_style : [],
        ideal_client_personality: profile.ideal_client_personality || "",
        preferred_client_genders: Array.isArray(profile.preferred_client_genders) ? profile.preferred_client_genders : ["all"],
        preferred_client_experience_levels: Array.isArray(profile.preferred_client_experience_levels) ? profile.preferred_client_experience_levels : [],
        hourly_rate: profile.hourly_rate || null,
        package_options: profile.package_options || [],
        free_discovery_call: profile.free_discovery_call || false,
        calendar_link: profile.calendar_link || "",
        communication_style: Array.isArray(profile.communication_style) ? profile.communication_style.join(', ') : profile.communication_style || "",
        video_checkins: profile.video_checkins || false,
        messaging_support: profile.messaging_support || false,
        weekly_programming_only: profile.weekly_programming_only || false,
        testimonials: profile.testimonials || [],
        // New activity-centric Ways of Working fields
        wow_how_i_work: profile.wow_how_i_work || "",
        wow_what_i_provide: profile.wow_what_i_provide || "",
        wow_client_expectations: profile.wow_client_expectations || "",
        wow_activities: profile.wow_activities || {
          wow_how_i_work: [],
          wow_what_i_provide: [],
          wow_client_expectations: []
        },
        wow_activity_assignments: profile.wow_activity_assignments || [],
        wow_visibility: profile.wow_visibility || "public",
        wow_setup_completed: profile.wow_setup_completed || false,
        terms_agreed: profile.terms_agreed || false,
        accuracy_confirmed: profile.accuracy_confirmed || false,
        notify_profile_views: profile.notify_profile_views || false,
        notify_messages: profile.notify_messages || true,
        notify_insights: profile.notify_insights || true,
        max_clients: profile.max_clients || null,
      };
      
      setFormData(prev => ({ ...prev, ...initialData }));
      initialFormData.current = { ...initialData };
      setHasUnsavedChanges(false);
      
      // Mark form as ready after initialization
      setIsFormReady(true);
      console.log('✅ INIT: Form is now ready for user interaction');
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

  // Stable update function with dirty field tracking
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setDirtyFields(prev => new Set([...prev, ...Object.keys(updates)]));
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
        break;
      case 11:
        if (!formData.terms_agreed) {
          newErrors.terms_agreed = "You must agree to the terms";
        }
        if (!formData.accuracy_confirmed) {
          newErrors.accuracy_confirmed = "You must confirm information accuracy";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Weight distribution for each step (total: 100%)
  const getStepWeight = (step: number): number => {
    const weights = {
      1: 13,  // Basic Info (most important)
      2: 10,  // Qualifications (important credibility)
      3: 10,  // Expertise & Services (core offering)
      4: 9,   // Client Fit Preferences (matching algorithm)
      5: 13,  // Rates & Packages (monetization, complex)
      6: 7,   // Discovery Calls (valuable but optional)
      7: 7,   // Testimonials & Case Studies (social proof)
      8: 9,   // Ways of Working (client experience)
      9: 7,   // Image Management (enhanced from 3% to 7%)
      10: 3,  // Working Hours (optional)
      11: 4,  // Terms & Notifications (compliance)
      12: 1,  // Verification Preference (simple setting)
      13: 6,  // Professional Documents (important for credibility)
      14: 1   // Profile Summary (final step, display only)
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
        
      case 2: // Qualifications - require 2+ qualifications, all without cert requirements OR all certs uploaded
        const qualCount = formData.qualifications?.length || 0;
        const certCount = formData.certificates?.length || 0;
        
        // If we have 2+ qualifications
        if (qualCount >= 2) {
          // Check if any certs are needed by looking at certificates array
          // If certificates array has items, assume some require verification
          // For now, mark as completed if we have 2+ qualifications (simplified logic)
          // TODO: Add requires_verification check when qualification metadata available
          return 'completed';
        }
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
        
      case 5: // Rates & Packages - only require packages
        const hasPackages = formData.package_options && formData.package_options.length > 0;
        return hasPackages ? 'completed' : 'not_started';
        
      case 6: // Discovery Calls
        console.log('🔍 Discovery Call Debug - Settings:', discoverySettings);
        const offersDiscovery = discoverySettings?.offers_discovery_call;
        const hasCalendarLink = !!formData.calendar_link?.trim();
        const hasDcSlots = !!discoverySettings.availability_schedule && 
          Object.values(discoverySettings.availability_schedule).some((d: any) => 
            d?.enabled === true && Array.isArray(d?.slots) && d.slots.length > 0
          );
        
        console.log('🔍 Discovery Call Debug - Values:', { offersDiscovery, hasCalendarLink, hasDcSlots });
        
        // If null, trainer hasn't made a choice yet
        if (offersDiscovery === null) return 'not_started';
        
        // If explicitly false, trainer chose to disable - mark as completed
        if (offersDiscovery === false) return 'completed';
        
        // If true and configured (calendar link OR in-app slots), completed
        if (hasCalendarLink || hasDcSlots) return 'completed';
        
        // Discovery calls enabled but not configured yet
        return 'partial';
        
      case 7: // Testimonials & Case Studies
        const hasTestimonials = formData.testimonials?.length > 0;
        return hasTestimonials ? 'completed' : 'not_started';
        
      case 8: // Ways of Working - check both completion checkbox and activities
        const validationCompletion = getValidationStepCompletion(formData, 8);
        const hasSetupCompleted = formData.wow_setup_completed === true;
        const hasActivities = formData.wow_activities && 
          Object.values(formData.wow_activities).some((arr: any) => Array.isArray(arr) && arr.length > 0);
        
        // If they have activities assigned, show as partial even if not marked complete
        if (hasActivities && !hasSetupCompleted) return 'partial';
        return hasSetupCompleted ? 'completed' : validationCompletion;
        
      case 9: // Image Management
        const selectedCount = getSelectedImagesCount();
        const validationStatus = getValidationStatus();
        
        // If images are selected and validation passes, mark as completed (gridSize not required)
        if (validationStatus.status === 'complete' && selectedCount > 0) {
          return 'completed';
        }
        // If any images selected, at least partial
        if (selectedCount > 0) {
          return 'partial';
        }
        return 'not_started';
        
      case 10: // Working Hours & New Client Availability
        console.log('🔍 Availability Debug - Settings:', availabilitySettings);
        
        // Consider local pending selection as well to avoid stale state
        const effectiveStatus = pendingAvailabilityChanges?.status || availabilitySettings?.availability_status;
        
        const hasWorkingHours = !!availabilitySettings?.availability_schedule && 
          Object.values(availabilitySettings.availability_schedule).some((day: any) => 
            day?.enabled && Array.isArray(day?.slots) && day.slots.length > 0
          );
        
        const hasValidStatus = effectiveStatus && 
          ['accepting', 'waitlist', 'unavailable'].includes(effectiveStatus as string);
        
        console.log('🔍 Availability Debug - Values:', { 
          hasWorkingHours, 
          hasValidStatus,
          effectiveStatus 
        });
        
        // Only mark completed if they've set working hours (explicit action)
        // Status alone is not enough since it has a database default
        if (hasWorkingHours) return 'completed';
        return 'not_started';
        
      case 11: // Terms & Notifications
        return (formData.terms_agreed && formData.accuracy_confirmed) ? 'completed' : 'not_started';
        
      case 12: // Verification Preference
        // Check if trainer has set a display preference (exists in DB)
        if (overview?.display_preference) {
          return 'completed';
        }
        return 'not_started';
        
      case 13: // Professional Documents
        console.log('🔍 Prof Documents Debug - Status:', getProfDocumentsStatus());
        return getProfDocumentsStatus();
        
      case 14: // Profile Summary (Verification)
        // First check if all documents are marked as "not applicable"
        const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
        const allNotApplicable = checkTypes.every(type => notApplicable?.[type] === true);
        
        if (allNotApplicable) {
          console.log('🔍 Verification Debug - All documents marked as not applicable');
          return 'completed';
        }
        
        // Check verification checks using enhanced verification system
        const verificationChecks = checkTypes.map(type => getCheckByType(type as any)).filter(Boolean);
        
        console.log('🔍 Verification Debug - Checks found:', verificationChecks.length);
        console.log('🔍 Verification Debug - Check details:', verificationChecks);
        
        if (verificationChecks.length === 0) return 'not_started';
        
        const verifiedCount = verificationChecks.filter(check => check?.status === 'verified').length;
        const pendingCount = verificationChecks.filter(check => check?.status === 'pending').length;
        const submittedCount = verificationChecks.filter(check => ['pending','verified','not_applicable'].includes(check?.status)).length;
        
        console.log('🔍 Verification Debug - Counts:', { verifiedCount, pendingCount, submittedCount });
        
        // All checks verified = completed (green)
        if (verifiedCount === checkTypes.length) return 'completed';
        
        // Any checks submitted/pending = partial (orange)
        if (submittedCount > 0) return 'partial';
        
        return 'not_started';
        
      default:
        return 'not_started';
    }
  };

  const handleSave = async (showFeedback: boolean = true) => {
    // 🛡️ PROTECTION 1: Don't save if form hasn't been initialized from profile
    if (!hasInitialized.current || !isFormReady) {
      console.error('🚫 DATA LOSS PROTECTION: Attempted to save before form was initialized', {
        hasInitialized: hasInitialized.current,
        isFormReady,
        profile_id: profile?.id
      });
      showError("Please wait for your profile to load before saving.");
      return;
    }
    
    // Skip save if no fields have changed
    if (dirtyFields.size === 0) {
      console.log('💾 SKIP: No dirty fields to save');
      if (showFeedback) {
        showSuccess("No changes to save");
      }
      return { data: true };
    }
    
    // 🛡️ PROTECTION 2: Don't overwrite existing data with empty values for critical fields
    const criticalFields = ['first_name', 'last_name', 'bio'];
    const hasExistingData = criticalFields.some(field => profile?.[field as keyof typeof profile]);
    const hasEmptyData = criticalFields.every(field => !formData[field as keyof typeof formData]);
    
    if (hasExistingData && hasEmptyData) {
      console.error('🚫 DATA LOSS PROTECTION: Attempted to save empty core fields over existing data', {
        profile_first_name: profile?.first_name,
        profile_last_name: profile?.last_name,
        profile_bio: profile?.bio,
        formData_first_name: formData.first_name,
        formData_last_name: formData.last_name,
        formData_bio: formData.bio
      });
      showError("Cannot save empty profile over existing data. Please wait for form to load completely.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('💾 SAVING: Profile save initiated', {
        hasInitialized: hasInitialized.current,
        isFormReady,
        dirtyFieldCount: dirtyFields.size,
        dirtyFields: [...dirtyFields],
        first_name: formData.first_name,
        last_name: formData.last_name
      });
      
      // Build save data only from dirty fields
      const changedData: Record<string, any> = {};
      
      dirtyFields.forEach(field => {
        const value = formData[field as keyof typeof formData];
        
        // Handle special field transformations
        if (field === 'delivery_format') {
          changedData[field] = [value];
        } else if (field === 'communication_style' && typeof value === 'string') {
          changedData[field] = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        } else if (field === 'certificates') {
          changedData['uploaded_certificates'] = value || [];
        } else {
          changedData[field] = value;
        }
      });
      
      console.log('💾 SAVING: Changed fields only:', changedData);
      
      const result = await updateProfile(changedData, { suppressToast: true });
      
      if (result && 'error' in result && result.error) {
        throw new Error(result.error.message || 'Failed to save profile');
      }
      
      if (showFeedback) {
        showSuccess("Changes saved successfully");
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Update initial form data and reset unsaved changes flag after successful save
      initialFormData.current = { ...formData };
      setHasUnsavedChanges(false);
      setDirtyFields(new Set()); // Clear dirty fields after save
      
      return result;
    } catch (error) {
      console.error('Error in handleSave:', error);
      showError("Failed to save profile. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Track pending schedule changes from WorkingHoursSection
  const [pendingScheduleChanges, setPendingScheduleChanges] = useState<any>(null);

  // Save availability settings to coach_availability_settings table
  const saveAvailabilitySettings = async (status: string, settings: any, schedule?: any) => {
    if (!user) return;

    try {
      const updateData: any = {
        coach_id: user.id,
        availability_status: status as 'accepting' | 'waitlist' | 'unavailable',
        next_available_date: settings.next_available_date,
        allow_discovery_calls_on_waitlist: settings.allow_discovery_calls_on_waitlist,
        auto_follow_up_days: settings.auto_follow_up_days,
        waitlist_message: settings.waitlist_message,
      };
      
      // Include schedule if provided
      if (schedule) {
        updateData.availability_schedule = schedule;
      }

      const { data, error } = await supabase
        .from('coach_availability_settings')
        .upsert(updateData, {
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

  // Handle schedule changes from WorkingHoursSection (local state only)
  const handleScheduleChange = (schedule: any) => {
    setPendingScheduleChanges(schedule);
    setDirtyFields(prev => new Set([...prev, 'availability_schedule']));
    setHasUnsavedChanges(true);
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      showWarning("Please complete all required fields before proceeding.");
      setValidationShake(true);
      setTimeout(() => setValidationShake(false), 400);
      return;
    }

    try {
      setIsLoading(true);
      
      await handleSave(true);

      // Save availability settings if there are pending changes (status or schedule)
      if (pendingAvailabilityChanges || pendingScheduleChanges) {
        const status = pendingAvailabilityChanges?.status || availabilitySettings?.availability_status || 'accepting';
        const settings = pendingAvailabilityChanges?.settings || {
          next_available_date: availabilitySettings?.next_available_date,
          allow_discovery_calls_on_waitlist: availabilitySettings?.allow_discovery_calls_on_waitlist,
          auto_follow_up_days: availabilitySettings?.auto_follow_up_days,
          waitlist_message: availabilitySettings?.waitlist_message,
        };
        
        await saveAvailabilitySettings(status, settings, pendingScheduleChanges);
        await refetchAvailability?.();
        setPendingAvailabilityChanges(null);
        setPendingScheduleChanges(null);
      }
      
      if (currentStep < totalSteps) {
        navigateToStep(currentStep + 1);
      } else {
        // Final step: only save dirty fields plus the completion flag
        const changedData: Record<string, any> = {};
        
        // Add only dirty fields with proper transformations
        dirtyFields.forEach(field => {
          const value = formData[field as keyof typeof formData];
          if (field === 'delivery_format') {
            changedData[field] = [value];
          } else if (field === 'communication_style' && typeof value === 'string') {
            changedData[field] = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          } else if (field === 'certificates') {
            changedData['uploaded_certificates'] = value || [];
          } else {
            changedData[field] = value;
          }
        });
        
        // Always set completion flag
        changedData.profile_setup_completed = true;
        
        await updateProfile(changedData, { suppressToast: true });
        showSuccess('Profile saved successfully');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        // Stay on the page so trainer can submit for review
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Centralized step navigation with smooth scroll-to-top
  const navigateToStep = (step: number) => {
    setCurrentStep(step);
    // Delay scroll to allow component to render
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1);
    }
  };

  const handlePreview = async () => {
    try {
      await handleSave(false);
      
      // Save availability settings if there are pending changes
      if (pendingAvailabilityChanges || pendingScheduleChanges) {
        const status = pendingAvailabilityChanges?.status || availabilitySettings?.availability_status || 'accepting';
        const settings = pendingAvailabilityChanges?.settings || {
          next_available_date: availabilitySettings?.next_available_date,
          allow_discovery_calls_on_waitlist: availabilitySettings?.allow_discovery_calls_on_waitlist,
          auto_follow_up_days: availabilitySettings?.auto_follow_up_days,
          waitlist_message: availabilitySettings?.waitlist_message,
        };
        
        await saveAvailabilitySettings(status, settings, pendingScheduleChanges);
        setPendingAvailabilityChanges(null);
        setPendingScheduleChanges(null);
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

  const getExitDestination = () => {
    return trainerAccessEnabled ? '/trainer/dashboard' : '/trainer/holding';
  };

  const handleSaveAndExit = async () => {
    try {
      await handleSave(false);
      
      // Save availability settings if there are pending changes (status or schedule)
      if (pendingAvailabilityChanges || pendingScheduleChanges) {
        const status = pendingAvailabilityChanges?.status || availabilitySettings?.availability_status || 'accepting';
        const settings = pendingAvailabilityChanges?.settings || {
          next_available_date: availabilitySettings?.next_available_date,
          allow_discovery_calls_on_waitlist: availabilitySettings?.allow_discovery_calls_on_waitlist,
          auto_follow_up_days: availabilitySettings?.auto_follow_up_days,
          waitlist_message: availabilitySettings?.waitlist_message,
        };
        
        await saveAvailabilitySettings(status, settings, pendingScheduleChanges);
        setPendingAvailabilityChanges(null);
        setPendingScheduleChanges(null);
      }
      
      navigate(getExitDestination());
    } catch (error) {
      // Error already handled in handleSave
    }
  };

  const handleDiscardAndExit = () => {
    navigate(getExitDestination());
  };

  const calculateProgress = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const calculateOverallCompletion = () => {
    let totalWeightedCompletion = 0;
    const stepDetails: any = {};
    
    for (let i = 1; i <= totalSteps; i++) {
      const stepWeight = getStepWeight(i);
      const stepCompletion = getStepCompletion(i);
      
      stepDetails[`step${i}`] = { weight: stepWeight, completion: stepCompletion };
      
      if (stepCompletion === 'completed') {
        totalWeightedCompletion += stepWeight;
      } else if (stepCompletion === 'partial') {
        totalWeightedCompletion += stepWeight * 0.5; // 50% weight for partial completion
      }
      // 'not_started' contributes 0
    }
    
    const finalPercentage = Math.min(Math.floor(totalWeightedCompletion), 100);
    
    console.log('🔍 Profile Setup - Step completions:', stepDetails);
    console.log('🔍 Profile Setup - Total weighted completion:', totalWeightedCompletion);
    console.log('🔍 Profile Setup - Final percentage:', finalPercentage);
    
    return finalPercentage;
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
        return <SimplifiedWaysOfWorkingSection {...commonProps} />;
      case 9:
        return <ImageManagementSection {...commonProps} />;
      case 10:
        return <WorkingHoursAndAvailabilitySection 
          {...commonProps} 
          onAvailabilityChange={handleAvailabilityChange}
          onScheduleChange={handleScheduleChange}
        />;
      case 11:
        return <TermsAndNotificationsSection {...commonProps} />;
      case 12:
        return <VerificationPreferenceSection />;
      case 13:
        return <ProfessionalDocumentsSection />;
      case 14:
        return <ProfileSummarySection />;
      default:
        return null;
    }
  };

  // Show full-page loading state while waiting
  if (!showContent) {
    return <ProfileLoadingState />;
  }

  return (
    <StatusFeedbackProvider>
      <div className="min-h-screen bg-gradient-hero opacity-0 animate-fadeIn">
        {/* Status Feedback Bar */}
        <InlineStatusBar
          message={status.message}
          variant={status.variant}
          isVisible={status.isVisible}
          onDismiss={hideStatus}
          autoDismiss={true}
          dismissDelay={5000}
        />
        
        {/* Header */}
        <div className="p-4 border-b bg-card">
        <div className="flex justify-between items-center relative">
          {/* Left: Logo + Back Button */}
          <div className="flex items-center gap-3">
            <AppLogo size="sm" showText={true} onClick={() => navigate('/')} />
            {trainerAccessEnabled && profile?.profile_setup_completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            )}
          </div>
          
          {/* Center: Title + Badge - Absolute positioned, hidden on mobile */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold whitespace-nowrap">
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
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="success" size="sm" onClick={() => handleSave()} className="flex-1 sm:flex-none">
                    <Save className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">{profile?.profile_setup_completed ? 'Update' : 'Save Draft'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{profile?.profile_setup_completed ? 'Update Profile' : 'Save Draft'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="sm" onClick={handlePreview} className="flex-1 sm:flex-none">
                    <Eye className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Preview</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PublishButton profile={profile} />
            {profile?.profile_published && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/trainer/${profile?.id}?from=profile-setup`)}
                      className="flex-1 sm:flex-none"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">View Live</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Live Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <ProfileDropdown profile={profile ? { 
              ...profile, 
              user_type: 'trainer',
              email: user?.email,
              verification_status: profile.verification_status
            } : null} />
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
        <ResponsiveBreadcrumb 
              className="px-4"
              currentStep={currentStep}
              steps={stepTitles.map((title, index) => ({
                stepNumber: index + 1,
                title,
                completion: getStepCompletion(index + 1),
              }))}
              onStepChange={setCurrentStep}
              totalSteps={totalSteps}
              overallProgress={calculateOverallCompletion()}
            >
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const completion = getStepCompletion(stepNumber);
                const isCurrent = stepNumber === currentStep;
                
                return (
                  <BreadcrumbItem
                    key={stepNumber}
                    stepNumber={stepNumber}
                    title={title}
                    completion={completion}
                    isCurrent={isCurrent}
                    onClick={() => navigateToStep(stepNumber)}
                  />
                );
              })}
            </ResponsiveBreadcrumb>
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
                    onClick={() => navigateToStep(stepNumber)}
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



      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Inline Status Bar */}
        <InlineStatusBar
          message={status.message}
          variant={status.variant}
          isVisible={status.isVisible}
          onDismiss={hideStatus}
          className="mb-4"
        />
        
        <Card className="relative">
          {/* Loading overlay to prevent interaction before form is ready */}
          {!isFormReady && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading your profile data...</p>
                <p className="text-xs text-muted-foreground">Please wait before making changes</p>
              </div>
            </div>
          )}
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
          
           <div className={currentStep === 1 ? "ml-auto flex items-center" : "flex items-center"}>
             <Button 
               variant={currentStep === totalSteps ? "success" : "hero"}
               onClick={handleNext}
               disabled={isLoading || !isFormReady}
               className={validationShake ? "animate-shake" : ""}
             >
               {isLoading ? (
                 <>
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   {currentStep === totalSteps ? 'Saving...' : 'Saving...'}
                 </>
               ) : currentStep === totalSteps ? (
                 <>
                   <CheckCircle className="h-4 w-4 mr-2" />
                   Save Profile
                 </>
               ) : (
                 <>
                   Next
                   <ArrowRight className="h-4 w-4 ml-2" />
                 </>
               )}
             </Button>
             {currentStep === totalSteps && (
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <button type="button" aria-label="Submission info" className="ml-2 inline-flex items-center">
                       <Info className="h-4 w-4" />
                     </button>
                   </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">
                        {(() => {
                          const requiredSteps = [1,2,3,4,5,6,8,10,11,12];
                          const incomplete = requiredSteps.filter(s => {
                            if (s === 12) {
                              return getProfDocumentsStatus() !== 'completed';
                            }
                            return getValidationStepCompletion(formData, s) !== 'completed';
                          }).map(s => stepTitles[s-1]);
                          return incomplete.length
                            ? `Complete these before submitting: ${incomplete.join(', ')}`
                            : 'All set! Click Publish to submit your profile for admin review.';
                        })()}
                      </p>
                    </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
             )}
           </div>
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
            location: formData.location || "Location TBD",
            hourlyRate: formData.hourly_rate || 75,
            image: formData.profile_photo_url || "/api/placeholder/150/150",
            profilePhotoUrl: formData.profile_photo_url,
            qualifications: formData.qualifications || [],
            certifications: formData.qualifications || [],
            description: formData.bio || "",
            availability: "Available",
            trainingType: formData.training_types || [],
            offers_discovery_call: formData.free_discovery_call || false,
            package_options: formData.package_options || [],
            verification_status: (profile as any)?.verification_status || 'pending',
            how_started: formData.how_started || "",
            philosophy: formData.philosophy || "",
            professional_milestones: formData.professional_milestones || [],
            testimonials: formData.testimonials || []
          }}
      />
      </div>
    </StatusFeedbackProvider>
  );
};

export default TrainerProfileSetup;