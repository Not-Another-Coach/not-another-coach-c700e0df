import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { useUserTypeChecks } from "@/hooks/useUserType";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { useTrainerVerification } from "@/hooks/useTrainerVerification";
import { useEnhancedTrainerVerification } from "@/hooks/useEnhancedTrainerVerification";
import { useDiscoveryCallSettings } from "@/hooks/useDiscoveryCallSettings";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { useTrainerImages } from "@/hooks/useTrainerImages";
import { useProfessionalDocumentsState } from "@/hooks/useProfessionalDocumentsState";
import { useToast } from "@/hooks/use-toast";
import { useProfileStepValidation } from "@/hooks/useProfileStepValidation";
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
  const { profile, loading: profileLoading, updateProfile } = useTrainerProfile();
  const { isTrainer } = useUserTypeChecks();
  const { packageWorkflows, loading: waysOfWorkingLoading } = usePackageWaysOfWorking();
  const { verificationRequest } = useTrainerVerification();
  const { getCheckByType, loading: verificationLoading, overview } = useEnhancedTrainerVerification();
  const { settings: discoverySettings } = useDiscoveryCallSettings();
  const { settings: availabilitySettings, refetch: refetchAvailability } = useCoachAvailability();
  const { getStepCompletion: getValidationStepCompletion } = useProfileStepValidation();
  const { getSelectedImagesCount, imagePreferences, getValidationStatus } = useTrainerImages();
  const { getCompletionStatus: getProfDocumentsStatus } = useProfessionalDocumentsState(profile?.document_not_applicable);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Combine critical loading states to show skeleton
  const isCriticalDataLoading = loading || profileLoading || verificationLoading;
  const [showContent, setShowContent] = useState(false);

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
    training_type_delivery: {},
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
    
    // Ways of Working - legacy fields still supported
    ways_of_working_onboarding: [],
    ways_of_working_first_week: [],
    ways_of_working_ongoing: [],
    ways_of_working_tracking: [],
    ways_of_working_expectations: [],
    ways_of_working_what_i_bring: [],
    
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

  // Stable loading check - wait 300ms minimum, then show content when data ready
  useEffect(() => {
    const minLoadTimer = setTimeout(() => {
      if (!isCriticalDataLoading) {
        setShowContent(true);
      }
    }, 300);

    return () => clearTimeout(minLoadTimer);
  }, [isCriticalDataLoading]);

  // Initialize form data from profile when available
  useEffect(() => {
    // Only initialize when we have a profile with an ID and haven't initialized yet
    if (profile && profile.id && !hasInitialized.current) {
      hasInitialized.current = true;
      
      console.log('Form data being initialized from profile:', {
        accuracy_confirmed: profile.accuracy_confirmed,
        terms_agreed: profile.terms_agreed,
        notify_profile_views: profile.notify_profile_views,
        notify_messages: profile.notify_messages,
        notify_insights: profile.notify_insights
      });
        
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
        training_type_delivery: profile.training_type_delivery || {},
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
        // First check if database record exists - if not, step hasn't been started
        if (!discoverySettings?.id) {
          return 'not_started';
        }
        
        console.log('🔍 Discovery Call Debug - Settings:', discoverySettings);
        const offersDiscovery = discoverySettings.offers_discovery_call;
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
        // Check verification checks using enhanced verification system
        const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
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

  const handleSave = async (showToast: boolean = true) => {
    try {
      setIsLoading(true);
      
      // Convert form data to match TrainerProfile interface types
      const saveData = {
        ...formData,
        // Store the current completion percentage for dashboard consistency
        profile_completion_percentage: calculateOverallCompletion(),
        // Explicitly include testimonials to ensure persistence
        testimonials: formData.testimonials || [],
        // Convert delivery_format from string to array
        delivery_format: [formData.delivery_format],
        // Convert communication_style from string to array
        communication_style: formData.communication_style.split(',').map(s => s.trim()).filter(s => s),
        // Ensure array fields are properly formatted
        ideal_client_types: formData.ideal_client_types || [],
        coaching_style: formData.coaching_style || [],
        specializations: formData.specializations || [],
        training_types: formData.training_types || [],
        // Map certificates back to uploaded_certificates for database storage
        uploaded_certificates: formData.certificates || [],
        // Explicitly include Ways of Working fields to ensure persistence
        wow_how_i_work: formData.wow_how_i_work || "",
        wow_what_i_provide: formData.wow_what_i_provide || "",
        wow_client_expectations: formData.wow_client_expectations || "",
        wow_activities: formData.wow_activities || {
          wow_how_i_work: [],
          wow_what_i_provide: [],
          wow_client_expectations: []
        },
        wow_activity_assignments: formData.wow_activity_assignments || [],
        wow_visibility: formData.wow_visibility || "public",
        wow_setup_completed: formData.wow_setup_completed || false,
        // Explicitly include terms and accuracy confirmation to ensure persistence
        terms_agreed: formData.terms_agreed || false,
        accuracy_confirmed: formData.accuracy_confirmed || false,
        // Explicitly include notification preferences
        notify_profile_views: formData.notify_profile_views || false,
        notify_messages: formData.notify_messages || true,
        notify_insights: formData.notify_insights || true,
      };
      
      console.log('Saving profile with accuracy_confirmed:', saveData.accuracy_confirmed);
      console.log('Saving profile with terms_agreed:', saveData.terms_agreed);
      
      console.log('Saving trainer profile data:', saveData);
      console.log('Testimonials being saved:', saveData.testimonials);
      console.log('Number of testimonials:', saveData.testimonials?.length || 0);
      console.log('Client types being saved:', saveData.ideal_client_types);
      console.log('Coaching styles being saved:', saveData.coaching_style);
      console.log('Ways of Working activities being saved:', saveData.wow_activities);
      console.log('Ways of Working assignments being saved:', saveData.wow_activity_assignments);
      console.log('WoW setup completed:', saveData.wow_setup_completed);
      
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
        await refetchAvailability?.();
        setPendingAvailabilityChanges(null);
      }
      
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step: only save profile, do not claim publication
        const completionData = {
          ...formData,
          delivery_format: [formData.delivery_format],
          communication_style: formData.communication_style.split(',').map(s => s.trim()).filter(s => s),
          profile_setup_completed: true
        };
        await updateProfile(completionData);
        toast({
          title: 'Profile saved',
          description: 'Your profile is saved.',
        });
        // Stay on the page so trainer can submit for review
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
    <div className="min-h-screen bg-background opacity-0 animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToDashboard}
                      disabled={!profile?.profile_setup_completed}
                      className="flex-shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </div>
                </TooltipTrigger>
                {!profile?.profile_setup_completed && (
                  <TooltipContent>
                    <p>Complete your profile to access the dashboard</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
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
            <PublishButton profile={profile} />
            {profile?.profile_published && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/trainer/${profile?.id}?from=profile-setup`)}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">View Live</span>
                <span className="xs:hidden">Live</span>
              </Button>
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
            <ResponsiveBreadcrumb className="px-4">
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
                    onClick={() => setCurrentStep(stepNumber)}
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
          
           <div className={currentStep === 1 ? "ml-auto flex items-center" : "flex items-center"}>
             <Button 
               onClick={handleNext}
               disabled={isLoading}
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
  );
};

export default TrainerProfileSetup;