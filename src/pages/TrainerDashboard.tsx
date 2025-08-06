import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCoachAnalytics } from "@/hooks/useCoachAnalytics";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useWaitlist } from "@/hooks/useWaitlist";
import { AvailabilitySettings } from "@/components/coach/AvailabilitySettings";
import { WaitlistManagement } from "@/components/coach/WaitlistManagement";
import { CoachFeedbackSummary } from "@/components/coach/CoachFeedbackSummary";
import { ActiveClientsSection } from "@/components/coach/ActiveClientsSection";
import { CoachSelectionRequests } from "@/components/coach-selection/CoachSelectionRequests";
import { ProspectsSection } from "@/components/coach/ProspectsSection";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { UpcomingSessionsWidget } from "@/components/dashboard/UpcomingSessionsWidget";

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
  const { analytics, shortlistedClients, loading: analyticsLoading } = useCoachAnalytics(profile?.id);
  const { isAdmin } = useUserRoles();
  const { waitlistEntries } = useWaitlist();
  const navigate = useNavigate();
  const [availabilityStatus, setAvailabilityStatus] = useState<'accepting' | 'waitlist' | 'unavailable'>('accepting');
  const [nextAvailableDate, setNextAvailableDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [prospectsCount, setProspectsCount] = useState(0);
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [activeView, setActiveView] = useState('dashboard');
  const [showProspectsDropdown, setShowProspectsDropdown] = useState(false);

  // Sync availability status with profile data
  useEffect(() => {
    console.log('Profile client_status:', profile?.client_status);
    if (profile?.client_status) {
      const statusMap = {
        'open': 'accepting' as const,
        'waitlist': 'waitlist' as const,
        'paused': 'unavailable' as const
      };
      const newStatus = statusMap[profile.client_status] || 'accepting';
      console.log('Setting availability status to:', newStatus);
      setAvailabilityStatus(newStatus);
      
      // Initialize next available date from profile
      if ((profile as any).next_available_date) {
        setNextAvailableDate(new Date((profile as any).next_available_date));
      }
    }
  }, [profile?.client_status]);

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
      profile.hourly_rate
    ];
    
    const completedFields = requiredFields.filter(field => {
      if (typeof field === 'boolean') return field;
      return field !== null && field !== undefined && field !== '' && field !== 0;
    }).length;
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const handleStatusChange = async (status: 'accepting' | 'waitlist' | 'unavailable') => {
    console.log('Changing status from', availabilityStatus, 'to', status);
    const previousStatus = availabilityStatus;
    setAvailabilityStatus(status);
    
    // Show date picker when moving to waitlist for the first time
    if (status === 'waitlist' && previousStatus !== 'waitlist' && !nextAvailableDate) {
      setShowDatePicker(true);
    }
    
    // Map status to client_status enum
    const clientStatusMap = {
      'accepting': 'onboarding' as const,
      'waitlist': 'browsing' as const,
      'unavailable': 'decision_pending' as const
    };
    
    const result = await updateProfile({ client_status: clientStatusMap[status] });
    console.log('Status update result:', result);
  };

  const handleNextAvailableDateChange = async (date: Date | undefined) => {
    setNextAvailableDate(date);
    setShowDatePicker(false);
    
    const dateString = date ? format(date, 'yyyy-MM-dd') : null;
    await updateProfile({ next_available_date: dateString } as any);
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
              
              {nextAvailableDate && availabilityStatus === 'waitlist' && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Available: {format(nextAvailableDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                </>
              )}
               
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
              onClick={() => navigate('/trainer/profile-setup')}
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
              Active Clients ({activeClientsCount})
            </Button>
            
            <Button
              variant={activeView === 'goals' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('goals')}
              className="flex items-center gap-2"
            >
              <Goal className="w-4 h-4" />
              Goals
            </Button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Content based on active view */}
        {activeView === 'dashboard' && (
          <>
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Key Stats + Performance */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* This Week's Goal Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">🎯 This Week's Goal</h3>
                    <p className="text-muted-foreground">Convert 3 new clients</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={33} className="w-32 h-2" />
                      <span className="text-sm text-muted-foreground">1/3</span>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
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
                      {analyticsLoading ? '...' : analytics?.total_shortlists || 18}
                    </div>
                    <p className="text-sm font-medium text-yellow-800">Shortlisted</p>
                    <p className="text-xs text-yellow-600 mt-1">+3 this week</p>
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

            {/* Primary Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
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
                </div>
              </CardContent>
            </Card>

            {/* Availability Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Availability Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="availability-status" className="text-sm font-medium">
                    Current Status
                  </Label>
                  <div className="flex items-center gap-2">
                    {availabilityStatus === 'accepting' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">Accepting New Clients</span>
                      </div>
                    )}
                    {availabilityStatus === 'waitlist' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-yellow-600 font-medium">Waitlist Only</span>
                      </div>
                    )}
                    {availabilityStatus === 'unavailable' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-600 font-medium">Not Available</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={availabilityStatus === 'accepting' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('accepting')}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Accepting
                  </Button>
                  <Button
                    variant={availabilityStatus === 'waitlist' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('waitlist')}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-3 h-3" />
                    Waitlist
                  </Button>
                  <Button
                    variant={availabilityStatus === 'unavailable' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('unavailable')}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Unavailable
                  </Button>
                </div>
                
                {availabilityStatus === 'waitlist' && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <Label className="text-sm font-medium">Next Available Date</Label>
                    <div className="flex items-center gap-2">
                      <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !nextAvailableDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {nextAvailableDate ? format(nextAvailableDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={nextAvailableDate}
                            onSelect={handleNextAvailableDateChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {nextAvailableDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNextAvailableDateChange(undefined)}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                     {nextAvailableDate && (
                       <p className="text-xs text-muted-foreground">
                         Clients will be notified when you become available again.
                       </p>
                     )}
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/trainer/profile-setup?tab=management')}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </Button>
               </div>
              </CardContent>
            </Card>

            {/* Coach Feedback Summary */}
            <CoachFeedbackSummary />
          </div>

          {/* Right Column: Compact Activity Widgets */}
          <div className="space-y-4">
            
            {/* Engagement Streak */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">🔥 3 Week Streak!</p>
                    <p className="text-xs text-green-600">You've updated your profile consistently</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Feed - Compact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Live Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-48 overflow-y-auto">
                <LiveActivityFeed />
              </CardContent>
            </Card>

            {/* Upcoming Sessions - Compact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent className="max-h-48 overflow-y-auto">
                <UpcomingSessionsWidget />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Match Quality Stats - Full Width */}
        {analytics?.match_tier_stats && (
          <Card className="mt-8">
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

        {/* Shortlisted Clients */}
        {shortlistedClients && shortlistedClients.length > 0 && (
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
          </>
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
          <ActiveClientsSection onCountChange={setActiveClientsCount} />
        )}
        
        {activeView === 'goals' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Goal className="w-5 h-5" />
                Goals & Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Goal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Goals Section</h3>
                <p className="text-sm text-muted-foreground">
                  Set and track your coaching goals and targets.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Message Button */}
      <FloatingMessageButton />
    </div>
  );
};

export default TrainerDashboard;