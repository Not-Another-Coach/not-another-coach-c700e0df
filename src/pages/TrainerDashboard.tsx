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
import { ActiveClientsSection } from "@/components/coach/ActiveClientsSection";
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
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
      'accepting': 'open' as const,
      'waitlist': 'waitlist' as const,
      'unavailable': 'paused' as const
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
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Mission Control</h1>
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
          {profile && (
            <ProfileDropdown 
              profile={profile} 
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>

      {/* Account Health Bar */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
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
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/trainer/profile-setup')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="prospects">Prospects ({prospectsCount})</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist ({waitlistEntries?.length || 0})</TabsTrigger>
            <TabsTrigger value="clients">Active Clients ({activeClientsCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
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

            {/* Performance Metrics with Visual Cues */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Profile Views with Trend */}
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsLoading ? '...' : analytics?.total_views || 256}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+12 this week</span>
                  </div>
                  {/* Mini sparkline effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-200 to-blue-300"></div>
                </CardContent>
              </Card>

              {/* Likes with Trend */}
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Likes</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsLoading ? '...' : analytics?.total_likes || 42}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+5 this week</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-200 to-red-300"></div>
                </CardContent>
              </Card>

              {/* Shortlisted with Trend */}
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsLoading ? '...' : analytics?.total_shortlists || 18}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+3 this week</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-200 to-yellow-300"></div>
                </CardContent>
              </Card>

              {/* Conversion Rate */}
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsLoading ? '...' : `${analytics?.conversion_rate?.toFixed(1) || 7.2}%`}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+1.3% this week</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-200 to-green-300"></div>
                </CardContent>
              </Card>
            </div>

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
                  Availability Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      variant={availabilityStatus === 'accepting' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange('accepting');
                      }}
                      className="flex items-center gap-2 h-12"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Accepting
                    </Button>
                    <Button 
                      variant={availabilityStatus === 'waitlist' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange('waitlist');
                      }}
                      className="flex items-center gap-2 h-12"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Waitlist
                    </Button>
                    <Button 
                      variant={availabilityStatus === 'unavailable' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange('unavailable');
                      }}
                      className="flex items-center gap-2 h-12"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Unavailable
                    </Button>
                  </div>
                  
                  {availabilityStatus === 'waitlist' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Next Available Date (optional)
                      </Label>
                      
                      <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full max-w-xs justify-start text-left font-normal h-10",
                              !nextAvailableDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {nextAvailableDate ? format(nextAvailableDate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={nextAvailableDate}
                            onSelect={handleNextAvailableDateChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <p className="text-xs text-muted-foreground">
                        This date will be shown to potential clients when they view your profile
                      </p>
                    </div>
                     )}
                 </div>
                 
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
          </div>

          {/* Right Column: Live Activity Feed + Actions */}
          <div className="space-y-6">
            
            {/* Engagement Streak */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">🔥 3 Week Streak!</p>
                    <p className="text-sm text-green-600">You've updated your profile consistently</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Feed */}
            <LiveActivityFeed />

            {/* Upcoming Sessions */}
            <UpcomingSessionsWidget />
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
          </TabsContent>
          
          <TabsContent value="prospects" className="mt-6">
            <ProspectsSection onCountChange={setProspectsCount} />
          </TabsContent>
          
          <TabsContent value="waitlist" className="mt-6">
            <WaitlistManagement />
          </TabsContent>
          
          <TabsContent value="clients" className="mt-6">
            <ActiveClientsSection onCountChange={setActiveClientsCount} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Message Button */}
      <FloatingMessageButton />
    </div>
  );
};

export default TrainerDashboard;