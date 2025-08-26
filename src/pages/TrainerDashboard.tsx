import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCoachAnalytics } from "@/hooks/useCoachAnalytics";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { MemoryMonitor } from "@/components/MemoryMonitor";

// Lazy load heavy components
const WaitlistManagement = lazy(() => import("@/components/coach/WaitlistManagement").then(m => ({ default: m.WaitlistManagement })));
const CoachFeedbackSummary = lazy(() => import("@/components/coach/CoachFeedbackSummary").then(m => ({ default: m.CoachFeedbackSummary })));
const ActiveClientsSection = lazy(() => import("@/components/coach/ActiveClientsSection").then(m => ({ default: m.ActiveClientsSection })));
const LiveActivityFeed = lazy(() => import("@/components/dashboard/LiveActivityFeed").then(m => ({ default: m.LiveActivityFeed })));

import { CoachSelectionRequests } from "@/components/coach-selection/CoachSelectionRequests";
import { ProspectsSection } from "@/components/coach/ProspectsSection";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { ClientProspectSummary } from "@/components/coach/ClientProspectSummary";
import { UpcomingSessionsWidget } from "@/components/dashboard/UpcomingSessionsWidget";
import { CoachExclusivityEndedAlert } from "@/components/dashboard/CoachExclusivityEndedAlert";
import { ClientOnboardingManagement } from "@/components/coach/ClientOnboardingManagement";
import { OnboardingSummaryWidget } from "@/components/dashboard/OnboardingSummaryWidget";
import { GoalsSection } from "@/components/goals/GoalsSection";

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
  DollarSign,
  Package,
  Target,
  Zap,
  Award,
  MessageCircle,
  TrendingDown,
  ArrowUpRight,
  CreditCard,
  Filter,
  Shield,
  ChevronDown,
  Home,
  UserSearch,
  Goal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TrainerDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { profile, loading: profileLoading, isTrainer, updateProfile } = useProfile();
  const { analytics, shortlistedClients, shortlistedStats, loading: analyticsLoading } = useCoachAnalytics(profile?.id);
  const { isAdmin } = useUserRoles();
  const { waitlistEntries } = useWaitlist();
  const { settings: availabilitySettings, loading: availabilityLoading } = useCoachAvailability();
  const navigate = useNavigate();
  const [availabilityStatus, setAvailabilityStatus] = useState<'accepting' | 'waitlist' | 'unavailable'>('accepting');
  const [prospectsCount, setProspectsCount] = useState(0);
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [activeView, setActiveView] = useState('dashboard');
  const [showProspectsDropdown, setShowProspectsDropdown] = useState(false);

  // Sync availability status with coach availability settings
  useEffect(() => {
    if (availabilitySettings?.availability_status) {
      console.log('Coach availability status:', availabilitySettings.availability_status);
      setAvailabilityStatus(availabilitySettings.availability_status);
    }
  }, [availabilitySettings?.availability_status]);

  // Redirect if not trainer
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const requiredFields = [
      profile.first_name,
      profile.last_name,
      profile.tagline,
      profile.location,
      profile.bio,
      profile.training_types?.length,
      profile.specializations?.length,
      profile.qualifications?.length,
      (profile as any).ideal_client_types?.length,
      (profile as any).coaching_styles?.length,
      profile.terms_agreed,
      (profile as any).package_options && (profile as any).package_options.length > 0
    ];
    
    const completedFields = requiredFields.filter(field => {
      if (typeof field === 'boolean') return field;
      return field !== null && field !== undefined && field !== '' && field !== 0;
    }).length;
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };


  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();
  const isProfileComplete = profileCompletion === 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        {/* Top Row - Mission Control and Profile Dropdown */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Mission Control</h1>
            
            {/* Status indicators */}
            <div className="flex items-center gap-4">
              {/* Profile Status */}
              <div className="flex items-center gap-2">
                {isProfileComplete ? (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                )}
                <span className="text-sm font-medium">
                  {isProfileComplete ? 'Profile Complete' : `Profile ${profileCompletion}% Complete`}
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              {/* Availability Status */}
              <div className="flex items-center gap-2">
                {availabilityStatus === 'accepting' && (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Accepting Clients</span>
                  </>
                )}
                {availabilityStatus === 'waitlist' && (
                  <>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-yellow-700">Waitlist Only</span>
                  </>
                )}
                {availabilityStatus === 'unavailable' && (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">Not Available</span>
                  </>
                )}
              </div>
               
              <Separator orientation="vertical" className="h-4" />
              
              {/* Next Billing */}
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Next Billing: Sep 1</span>
              </div>
            </div>
            
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/trainer/profile-setup?tab=working-hours')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile Management
            </Button>
            {profile && (
              <ProfileDropdown 
                profile={profile} 
                onSignOut={handleSignOut}
              />
            )}
          </div>
        </div>

        {/* Bottom Row - Navigation Menu */}
        <div className="px-4 pb-4">
          <nav className="flex items-center gap-1">
            <Button
              variant={activeView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
            
            <DropdownMenu open={showProspectsDropdown} onOpenChange={setShowProspectsDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={activeView === 'prospects' || activeView === 'waitlist' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserSearch className="w-4 h-4" />
                  Prospects ({prospectsCount + (waitlistEntries?.length || 0)})
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => { setActiveView('prospects'); setShowProspectsDropdown(false); }}>
                  <UserSearch className="w-4 h-4 mr-2" />
                  Active Prospects ({prospectsCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setActiveView('waitlist'); setShowProspectsDropdown(false); }}>
                  <Users className="w-4 h-4 mr-2" />
                  Waitlist ({waitlistEntries?.length || 0})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant={activeView === 'clients' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('clients')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Clients & Prospects ({activeClientsCount + prospectsCount})
            </Button>
            
            <Button
              variant={activeView === 'templates' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('templates')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Template Management
            </Button>
            
            <Button
              variant={activeView === 'goals' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('goals')}
              className="flex items-center gap-2"
            >
              <Goal className="w-4 h-4" />
              Goals & Tasks
            </Button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                <div className="grid md:grid-cols-4 gap-3">
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => navigate('/trainer/profile-setup?tab=testimonials')}
                  >
                    <Plus className="h-4 w-4" />
                    Add Testimonial
                  </Button>
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => navigate('/trainer/profile-setup?tab=rates')}
                  >
                    <DollarSign className="h-4 w-4" />
                    Update Rates
                  </Button>
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => navigate('/trainer/profile-setup?tab=rates')}
                  >
                    <Package className="h-4 w-4" />
                    Add New Package
                  </Button>
                  <Button 
                    className="h-12 justify-start gap-3" 
                    variant="default"
                    onClick={() => navigate('/trainer/profile-setup?tab=working-hours')}
                  >
                    <Settings className="h-4 w-4" />
                    Manage Availability
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
                      {analyticsLoading ? '...' : analytics?.total_views || 256}
                    </div>
                    <p className="text-sm font-medium text-blue-800">Profile Views</p>
                    <p className="text-xs text-blue-600 mt-1">+12 this week</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {analyticsLoading ? '...' : analytics?.total_likes || 42}
                    </div>
                    <p className="text-sm font-medium text-red-800">Likes</p>
                    <p className="text-xs text-red-600 mt-1">+5 this week</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {analyticsLoading ? '...' : shortlistedStats.total}
                    </div>
                    <p className="text-sm font-medium text-yellow-800">Shortlisted & Discovery</p>
                    <p className="text-xs text-yellow-600 mt-1">+{shortlistedStats.last7Days} this week</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analyticsLoading ? '...' : `${analytics?.conversion_rate?.toFixed(1) || 7.2}%`}
                    </div>
                    <p className="text-sm font-medium text-green-800">Conversion Rate</p>
                    <p className="text-xs text-green-600 mt-1">+1.3% this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2b. Client Onboarding Summary */}
            <OnboardingSummaryWidget />

            {/* 3. Upcoming Sessions and This Week's Goal - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Upcoming Sessions */}
              <UpcomingSessionsWidget />

              {/* This Week's Goal */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-6 flex items-center justify-between min-h-[12rem]">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">🎯 This Week's Goal</h3>
                    <p className="text-muted-foreground">Convert 3 new clients</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={33} className="w-32 h-2" />
                      <span className="text-sm text-muted-foreground">1/3</span>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-primary flex-shrink-0" />
                </CardContent>
              </Card>
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
        
        {activeView === 'prospects' && (
          <div className="space-y-6">
            <CoachSelectionRequests />
            <ProspectsSection onCountChange={setProspectsCount} />
          </div>
        )}
        
        {activeView === 'waitlist' && (
          <WaitlistManagement />
        )}
        
        {activeView === 'clients' && (
          <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded"></div>}>
            <ClientProspectSummary 
              onActiveClientsCountChange={setActiveClientsCount}
              onProspectsCountChange={setProspectsCount}
            />
          </Suspense>
        )}

        {activeView === 'templates' && (
          <Suspense fallback={<div className="text-center p-8">Loading template management...</div>}>
            <ClientOnboardingManagement />
          </Suspense>
        )}
        
        {activeView === 'goals' && (
          <GoalsSection />
        )}

      </div>

      {/* Floating Message Button */}
      <FloatingMessageButton />
      
      {/* Memory Monitor - Always show in this environment */}
      <MemoryMonitor />
    </div>
  );
};

export default TrainerDashboard;