import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { useCoachAnalytics } from "@/hooks/useCoachAnalytics";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { MemoryMonitor } from "@/components/MemoryMonitor";

// Lazy load heavy components
const WaitlistManagement = lazy(() => import("@/components/coach/WaitlistManagement"));
const CoachFeedbackSummary = lazy(() => import("@/components/coach/CoachFeedbackSummary").then(m => ({ default: m.CoachFeedbackSummary })));
const ActiveClientsSection = lazy(() => import("@/components/coach/ActiveClientsSection").then(m => ({ default: m.ActiveClientsSection })));
const LiveActivityFeed = lazy(() => import("@/components/dashboard/LiveActivityFeed").then(m => ({ default: m.LiveActivityFeed })));

import { CoachSelectionRequests } from "@/components/coach-selection/CoachSelectionRequests";
import { ProspectsSection } from "@/components/coach/ProspectsSection";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { ClientProspectSummary } from "@/components/coach/ClientProspectSummary";
import { TrainerCalendar } from "@/components/dashboard/TrainerCalendar";
import { CoachExclusivityEndedAlert } from "@/components/dashboard/CoachExclusivityEndedAlert";
import { ClientOnboardingManagement } from "@/components/coach/ClientOnboardingManagement";
import { OnboardingSummaryWidget } from "@/components/dashboard/OnboardingSummaryWidget";
import { GoalsSection } from "@/components/goals/GoalsSection";
import { WeeklyExecutionCard } from "@/components/dashboard/WeeklyExecutionCard";
import { HighlightsContentTab } from "@/components/trainer/HighlightsContentTab";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  CalendarIcon, 
  Edit3, 
  Star, 
  TrendingUp, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Heart,
  Plus,
  Coins,
  Package,
  Target,
  FileText,
  CreditCard,
  Zap,
  Award,
  MessageCircle,
  TrendingDown,
  ArrowUpRight,
  Filter,
  Shield,
  ChevronDown,
  Home,
  UserSearch,
  Goal,
  Calendar,
  ExternalLink,
  Menu,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

import { PaymentStatementView } from "@/components/payment-statements/PaymentStatementView";
import { MembershipSettings } from "@/components/payment-statements/MembershipSettings";
import { usePaymentStatements } from "@/hooks/usePaymentStatements";
import { TrainerCustomHeader } from "@/components/layout/TrainerCustomHeader";

const TrainerDashboard = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useTrainerProfile();
  const { analytics, shortlistedClients, shortlistedStats, loading: analyticsLoading } = useCoachAnalytics(profile?.id);
  const { isAdmin } = useUserRoles();
  const { waitlistEntries } = useWaitlist();
  const { settings: availabilitySettings, loading: availabilityLoading } = useCoachAvailability();
  const { packages, loading: packagesLoading } = usePaymentStatements();
  const isMobile = useIsMobile();
  
  console.log('🔥 TrainerDashboard: Payment packages:', packages?.length || 0, 'loading:', packagesLoading);
  const navigate = useNavigate();
  const [availabilityStatus, setAvailabilityStatus] = useState<'accepting' | 'waitlist' | 'unavailable'>('accepting');
  const [prospectsCount, setProspectsCount] = useState(0);
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [activeView, setActiveView] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Remove unused state
  // const [showProspectsDropdown, setShowProspectsDropdown] = useState(false);

  // Sync availability status with coach availability settings
  useEffect(() => {
    if (availabilitySettings?.availability_status) {
      console.log('Coach availability status:', availabilitySettings.availability_status);
      setAvailabilityStatus(availabilitySettings.availability_status);
    }
  }, [availabilitySettings?.availability_status]);

  // User is already in trainer dashboard, no need to check user_type

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    // Use stored completion percentage if available (from profile setup)
    if ((profile as any).profile_completion_percentage !== undefined) {
      console.log('🔍 Dashboard - Using stored completion percentage:', (profile as any).profile_completion_percentage);
      return (profile as any).profile_completion_percentage;
    }
    
    console.log('🔍 Dashboard - Calculating completion from profile data (fallback)');
    
    // Use the same weighted system as profile setup to ensure consistency
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
        9: 4,   // Instagram Integration (optional, lower weight)
        10: 3,  // Image Management (optional, cosmetic)
        11: 3,  // Working Hours (optional)
        12: 4,  // Terms & Notifications (compliance)
        13: 7,  // Professional Documents (important for credibility)
        14: 1   // Verification (final step, external dependency)
      };
      return weights[step] || 0;
    };

    const getStepCompletion = (step: number): 'completed' | 'partial' | 'not_started' => {
      switch (step) {
        case 1: // Basic Info - match profile setup (no location check)
          const hasAllBasicInfo = profile.first_name && profile.last_name && 
            profile.tagline && profile.bio;
          const hasPartialBasicInfo = (profile.first_name || profile.last_name || 
            profile.tagline || profile.bio);
          return hasAllBasicInfo ? 'completed' : (hasPartialBasicInfo ? 'partial' : 'not_started');
          
        case 2: // Qualifications
          const qualCount = profile.qualifications?.length || 0;
          if (qualCount >= 2) return 'completed';
          if (qualCount >= 1) return 'partial';
          return 'not_started';
          
        case 3: // Expertise
          const hasExpertise = profile.specializations?.length > 0 && profile.training_types?.length > 0;
          const hasPartialExpertise = profile.specializations?.length > 0 || profile.training_types?.length > 0;
          return hasExpertise ? 'completed' : (hasPartialExpertise ? 'partial' : 'not_started');
          
        case 4: // Client Fit
          const hasClientTypes = (profile as any).ideal_client_types?.length > 0;
          const hasCoachingStyles = (profile as any).coaching_style?.length > 0;
          const hasAllClientFit = hasClientTypes && hasCoachingStyles;
          const hasPartialClientFit = hasClientTypes || hasCoachingStyles;
          return hasAllClientFit ? 'completed' : (hasPartialClientFit ? 'partial' : 'not_started');
          
        case 5: // Rates & Packages
          const hasPackages = (profile as any).package_options && (profile as any).package_options.length > 0;
          return hasPackages ? 'completed' : 'not_started';
          
        case 6: // Discovery Calls - be more lenient like profile setup
          const hasCalendarLink = (profile as any).calendar_link?.trim();
          // Assume some discovery call setup if calendar link exists
          return hasCalendarLink ? 'completed' : 'not_started';
          
        case 7: // Testimonials
          const hasTestimonials = (profile as any).testimonials?.length > 0;
          return hasTestimonials ? 'completed' : 'not_started';
          
        case 8: // Ways of Working - be more generous like profile setup
          const hasWowSetup = (profile as any).wow_setup_completed === true;
          const hasWowActivities = (profile as any).wow_activities && 
            Object.values((profile as any).wow_activities).some((arr: any) => Array.isArray(arr) && arr.length > 0);
          if (hasWowSetup) return 'completed';
          if (hasWowActivities) return 'partial';
          return 'not_started';
          
        case 9: // Instagram Integration - assume connected if Instagram data exists
          const hasInstagramData = (profile as any).instagram_handle || (profile as any).instagram_media;
          return hasInstagramData ? 'completed' : 'not_started';
          
        case 10: // Image Management - be more generous
          const hasProfilePhoto = profile.profile_photo_url;
          const hasGalleryImages = (profile as any).gallery_images?.length > 0;
          if (hasProfilePhoto && hasGalleryImages) return 'completed';
          if (hasProfilePhoto || hasGalleryImages) return 'partial';
          return 'not_started';
          
        case 11: // Working Hours & Availability - assume configured
          return 'completed'; // Profile setup likely has this configured
          
        case 12: // Terms & Notifications
          return profile.terms_agreed ? 'completed' : 'not_started';
          
        case 13: // Professional Documents - be more generous
          const hasProfDocs = (profile as any).uploaded_certificates?.length > 0;
          const hasInsurance = (profile as any).insurance_documents?.length > 0;
          if (hasProfDocs && hasInsurance) return 'completed';
          if (hasProfDocs || hasInsurance) return 'partial';
          return 'not_started';
          
        case 14: // Verification - match profile setup logic
          const verificationStatus = (profile as any).verification_status;
          // If any verification requests exist, assume partial
          if (verificationStatus === 'verified') return 'completed';
          if (verificationStatus === 'pending' || verificationStatus === 'under_review') return 'partial';
          return 'partial'; // Assume some verification in progress
          
        default:
          return 'not_started';
      }
    };

    console.log('🔍 Dashboard - Profile data for completion calculation:', {
      first_name: profile.first_name,
      last_name: profile.last_name,
      tagline: profile.tagline,
      bio: profile.bio,
      training_types: profile.training_types?.length,
      specializations: profile.specializations?.length,
      qualifications: profile.qualifications?.length,
      ideal_client_types: (profile as any).ideal_client_types?.length,
      coaching_style: (profile as any).coaching_style?.length,
      package_options: (profile as any).package_options?.length,
      terms_agreed: profile.terms_agreed,
      calendar_link: (profile as any).calendar_link ? 'exists' : 'missing',
      testimonials: (profile as any).testimonials?.length,
      wow_setup_completed: (profile as any).wow_setup_completed,
      verification_status: (profile as any).verification_status
    });

    let totalWeightedCompletion = 0;
    const stepDetails: any = {};
    
    for (let i = 1; i <= 14; i++) {
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
    
    const finalPercentage = Math.min(Math.round(totalWeightedCompletion), 100);
    
    console.log('🔍 Dashboard - Step completions:', stepDetails);
    console.log('🔍 Dashboard - Total weighted completion:', totalWeightedCompletion);
    console.log('🔍 Dashboard - Final percentage:', finalPercentage);
    
    return finalPercentage; // Ensure max 100%
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
      {/* New Trainer Custom Header */}
      <TrainerCustomHeader 
        profile={profile}
        availabilityStatus={availabilityStatus}
        onMessagingOpen={() => {
          // Trigger messaging popup
          const event = new CustomEvent('openMessagePopup');
          window.dispatchEvent(event);
        }}
      />

      {/* Navigation Menu - Moved out of header */}
      <div className="border-b bg-card">
        <div className="px-6 lg:px-8 xl:px-12 py-4">
          {isMobile ? (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center gap-2 w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  {activeView === 'dashboard' && <Home className="w-4 h-4" />}
                  {activeView === 'clients' && <Users className="w-4 h-4" />}
                  {activeView === 'all-prospects' && <UserSearch className="w-4 h-4" />}
                  {activeView === 'templates' && <CheckCircle className="w-4 h-4" />}
                  {activeView === 'goals' && <Goal className="w-4 h-4" />}
                  {activeView === 'content' && <FileText className="w-4 h-4" />}
                  {activeView === 'payments' && <CreditCard className="w-4 h-4" />}
                  {activeView === 'dashboard' && 'Dashboard'}
                  {activeView === 'clients' && `Clients (${activeClientsCount})`}
                  {activeView === 'all-prospects' && `Prospects (${prospectsCount + (waitlistEntries?.length || 0)})`}
                  {activeView === 'templates' && 'Templates'}
                  {activeView === 'goals' && 'Goals'}
                  {activeView === 'content' && 'Content'}
                  {activeView === 'payments' && 'Payments'}
                </span>
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              
              {showMobileMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
                  <Button
                    variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {setActiveView('dashboard'); setShowMobileMenu(false);}}
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={activeView === 'clients' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {setActiveView('clients'); setShowMobileMenu(false);}}
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <Users className="w-4 h-4" />
                    Clients ({activeClientsCount})
                  </Button>
                  <Button
                    variant={activeView === 'all-prospects' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {setActiveView('all-prospects'); setShowMobileMenu(false);}}
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <UserSearch className="w-4 h-4" />
                    Prospects ({prospectsCount + (waitlistEntries?.length || 0)})
                  </Button>
                  <Button
                    variant={activeView === 'templates' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {setActiveView('templates'); setShowMobileMenu(false);}}
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Templates
                  </Button>
                  <Button
                    variant={activeView === 'goals' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {setActiveView('goals'); setShowMobileMenu(false);}}
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <Goal className="w-4 h-4" />
                    Goals
                  </Button>
                  <Button
                    variant={activeView === 'content' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {setActiveView('content'); setShowMobileMenu(false);}}
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <FileText className="w-4 h-4" />
                    Content
                  </Button>
                  <Button
                    variant={activeView === 'payments' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {setActiveView('payments'); setShowMobileMenu(false);}}
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
              
              <Button
                variant={activeView === 'clients' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('clients')}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <Users className="w-4 h-4" />
                <span className="hidden lg:inline">Clients ({activeClientsCount})</span>
                <span className="lg:hidden hidden md:inline">Clients</span>
              </Button>
              
              <Button
              variant={activeView === 'all-prospects' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('all-prospects')}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <UserSearch className="w-4 h-4" />
              <span className="hidden lg:inline">Prospects ({prospectsCount + (waitlistEntries?.length || 0)})</span>
              <span className="lg:hidden hidden md:inline">Prospects</span>
            </Button>
            
          <Button 
            variant={activeView === 'templates' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('templates')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Templates</span>
            <span className="lg:hidden hidden md:inline">Templates</span>
          </Button>
          
          <Button
            variant={activeView === 'goals' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('goals')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Goal className="w-4 h-4" />
            <span className="hidden lg:inline">Goals & Tasks</span>
            <span className="lg:hidden hidden md:inline">Goals</span>
          </Button>
          
          <Button
            variant={activeView === 'content' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('content')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">Content</span>
          </Button>
          
              <Button
                variant={activeView === 'payments' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('payments')}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <CreditCard className="w-4 w-4" />
                <span className="hidden lg:inline">Payment & Payouts</span>
                <span className="lg:hidden hidden md:inline">Payments</span>
              </Button>
            </nav>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Qualification and Specialty Request Alerts - Moved to Live Activity Feed */}
        <div className="mb-6 space-y-4">
          {/* Alerts moved to Live Activity Feed */}
        </div>
        
        {/* Content based on active view */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Exclusive Period Alerts */}
            <CoachExclusivityEndedAlert />
            
            {/* 1. Quick Actions - Right after header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => navigate('/trainer/profile-setup?tab=testimonials')}
                  >
                    <Plus className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Manage Testimonials</span>
                  </Button>
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => setActiveView('payments')}
                  >
                    <Coins className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Payment Statements</span>
                  </Button>
                  {isAdmin && (
                    <Button 
                      className="h-12 justify-start gap-3" 
                      variant="outline"
                      onClick={() => navigate('/admin/dashboard')}
                    >
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Admin Panel</span>
                    </Button>
                  )}
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => navigate('/trainer/profile-setup?tab=rates')}
                  >
                    <Package className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Manage Packages</span>
                  </Button>
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => navigate('/trainer/profile-setup?tab=working-hours')}
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Manage Availability</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 2. Performance Metrics - Full Width */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {analyticsLoading ? '...' : analytics?.total_views || '--'}
                    </div>
                    <p className="text-sm font-medium text-blue-800">Profile Views</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analytics?.total_views ? '+12 this week' : 'No data yet'}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {analyticsLoading ? '...' : analytics?.total_likes || '--'}
                    </div>
                    <p className="text-sm font-medium text-red-800">Likes</p>
                    <p className="text-xs text-red-600 mt-1">
                      {analytics?.total_likes ? '+5 this week' : 'No data yet'}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {analyticsLoading ? '...' : (shortlistedStats.total > 0 ? shortlistedStats.total : '--')}
                    </div>
                    <p className="text-sm font-medium text-yellow-800">Shortlisted & Discovery</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {shortlistedStats.last7Days > 0 ? `+${shortlistedStats.last7Days} this week` : 'No data yet'}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analyticsLoading ? '...' : 
                        analytics?.conversion_rate ? `${analytics.conversion_rate.toFixed(1)}%` : '--'}
                    </div>
                    <p className="text-sm font-medium text-green-800">Conversion Rate</p>
                    <p className="text-xs text-green-600 mt-1">
                      {analytics?.conversion_rate ? '+1.3% this week' : 'No data yet'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2b. Client Onboarding Summary */}
            <OnboardingSummaryWidget />

            {/* 3. Coaching Calendar and This Week's Goal - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Coaching Calendar */}
              <TrainerCalendar />

              {/* Weekly Execution & Today's Tasks */}
              <WeeklyExecutionCard />
            </div>

            {/* 4. Live Activity and Coach Feedback - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Live Activity */}
              <LiveActivityFeed />

              {/* Coach Feedback Summary */}
              <CoachFeedbackSummary />
            </div>

            {/* 5. Match Quality Distribution */}
            {analytics?.match_tier_stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Match Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {analytics.match_tier_stats.perfect_matches || 0}
                      </div>
                      <p className="text-sm font-medium text-green-800">Perfect Matches</p>
                      <p className="text-xs text-green-600 mt-1">90%+ compatibility</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {analytics.match_tier_stats.great_matches || 0}
                      </div>
                      <p className="text-sm font-medium text-blue-800">Great Matches</p>
                      <p className="text-xs text-blue-600 mt-1">75-89% compatibility</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {analytics.match_tier_stats.good_matches || 0}
                      </div>
                      <p className="text-sm font-medium text-yellow-800">Good Matches</p>
                      <p className="text-xs text-yellow-600 mt-1">60-74% compatibility</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {analytics.match_tier_stats.potential_matches || 0}
                      </div>
                      <p className="text-sm font-medium text-orange-800">Potential Matches</p>
                      <p className="text-xs text-orange-600 mt-1">45-59% compatibility</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

        {/* Shortlisted Clients - Show only on dashboard view */}
        {activeView === 'dashboard' && shortlistedClients && shortlistedClients.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Shortlisted Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shortlistedClients.slice(0, 5).map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div>
                      <p className="font-medium">Client #{client.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.primary_goals?.length ? `Goals: ${client.primary_goals.join(', ')}` : 'No goals specified'}
                      </p>
                    </div>
                    <Badge variant={((client as any).discovery_call_booked ? 'default' : 'secondary')}>
                      {(client as any).discovery_call_booked ? 'Call Booked' : 'Available'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

          </div>
        )}
        
        {/* Remove old prospects and waitlist views - now handled in all-prospects */}
        
        {activeView === 'clients' && (
          <div className="space-y-6">
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded"></div>}>
              <ActiveClientsSection onCountChange={setActiveClientsCount} />
            </Suspense>
          </div>
        )}

        {activeView === 'all-prospects' && (
          <div className="space-y-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active Prospects</TabsTrigger>
                <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-6">
                <CoachSelectionRequests />
                <ProspectsSection onCountChange={setProspectsCount} />
              </TabsContent>
              <TabsContent value="waitlist" className="space-y-6">
                <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded"></div>}>
                  <WaitlistManagement />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeView === 'templates' && (
          <Suspense fallback={<div className="text-center p-8">Loading template management...</div>}>
            <ClientOnboardingManagement />
          </Suspense>
        )}
        
        {activeView === 'goals' && (
          <GoalsSection />
        )}
        
        {activeView === 'content' && (
          <div className="space-y-6">
            <HighlightsContentTab />
          </div>
        )}
        
        {activeView === 'payments' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Packages</p>
                      <p className="text-2xl font-bold">{packages?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold">--</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50">
                      <Coins className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                      <p className="text-2xl font-bold">--</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Payout</p>
                      <p className="text-2xl font-bold">--</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Package Management Quick Link */}
            <Card className="mb-6 border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Package Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your training packages, rates, and payment options in Profile Setup
                      </p>
                    </div>
                  </div>
                <Button 
                  onClick={() => navigate('/trainer/profile-setup?tab=rates')}
                  className="flex items-center gap-2"
                >
                  Manage Packages
                  <Package className="h-4 w-4" />
                </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="statements" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="statements" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Statements
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Payout History
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="statements">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Statements</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View detailed payment statements and payout schedules for your packages
                    </p>
                  </CardHeader>
                   <CardContent>
                     {packagesLoading ? (
                       <div className="text-center py-8">
                         <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                         <p className="text-muted-foreground">Loading payment statements...</p>
                       </div>
                     ) : packages && packages.length > 0 ? (
                       <div className="space-y-4">
                          {packages.map((pkg) => (
                            <div key={pkg.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{pkg.title}</h4>
                                <Badge variant="secondary">
                                  £{pkg.final_price_amount}
                                </Badge>
                              </div>
                              <PaymentStatementView packageId={pkg.id} viewerRole="trainer" />
                            </div>
                          ))}
                       </div>
                     ) : (
                       <div className="text-center py-8">
                         <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                         <h3 className="text-lg font-medium mb-2">No payment packages found</h3>
                         <p className="text-muted-foreground mb-4">
                           Payment packages will appear here once clients complete purchases
                         </p>
                         <div className="flex gap-2 justify-center">
                           <Button onClick={() => navigate('/trainer/profile-setup?tab=rates-packages')}>
                             Configure Packages
                           </Button>
                           <Button variant="outline" onClick={() => window.location.reload()}>
                             Refresh Data
                           </Button>
                         </div>
                       </div>
                     )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track your completed payouts and earnings
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No payout history</h3>
                      <p className="text-muted-foreground">
                        Your payout history will appear here once you start receiving payments
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <MembershipSettings />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <FloatingMessageButton />
      <MemoryMonitor />
    </div>
  );
};

export default TrainerDashboard;