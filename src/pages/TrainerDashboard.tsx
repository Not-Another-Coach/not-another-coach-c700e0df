import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCoachAnalytics } from "@/hooks/useCoachAnalytics";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Calendar, 
  Edit3, 
  Star, 
  TrendingUp, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Heart
} from "lucide-react";

const TrainerDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { profile, loading: profileLoading, isTrainer, updateProfile } = useProfile();
  const { analytics, shortlistedClients, loading: analyticsLoading } = useCoachAnalytics(profile?.id);
  const navigate = useNavigate();
  const [availabilityStatus, setAvailabilityStatus] = useState<'accepting' | 'waitlist' | 'unavailable'>('accepting');

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
    setAvailabilityStatus(status);
    
    // Map status to client_status enum
    const clientStatusMap = {
      'accepting': 'open' as const,
      'waitlist': 'waitlist' as const,
      'unavailable': 'paused' as const
    };
    
    const result = await updateProfile({ client_status: clientStatusMap[status] });
    console.log('Status update result:', result);
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
          <h1 className="text-xl font-bold">PT Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          {profile && (
            <ProfileDropdown 
              profile={profile} 
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>

      {/* Hero Header - PT Specific */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🎯 Build Your Fitness Brand. Attract the Right Clients.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Manage your profile, share your expertise, and connect with motivated clients who match your coaching style.
            </p>
            
            {/* Profile Completion Banner */}
            <Card className={`mb-6 ${!isProfileComplete ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isProfileComplete ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    <span className={`text-sm font-medium ${!isProfileComplete ? 'text-amber-800' : 'text-green-800'}`}>
                      Profile {profileCompletion}% Complete
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/trainer/profile-setup')}
                    className={!isProfileComplete ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
                  </Button>
                </div>
                <Progress value={profileCompletion} className="h-2" />
                <p className={`text-xs mt-2 ${!isProfileComplete ? 'text-amber-700' : 'text-green-700'}`}>
                  {isProfileComplete 
                    ? 'Your profile is complete and published!' 
                    : 'Finish your profile to get discovered by ideal clients'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Toggle */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Availability Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={availabilityStatus === 'accepting'} 
                  onCheckedChange={() => handleStatusChange('accepting')}
                />
                <label className="text-sm font-medium">
                  ✅ Accepting New Clients
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={availabilityStatus === 'waitlist'} 
                  onCheckedChange={() => handleStatusChange('waitlist')}
                />
                <label className="text-sm font-medium">
                  ⏳ Waitlist Only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={availabilityStatus === 'unavailable'} 
                  onCheckedChange={() => handleStatusChange('unavailable')}
                />
                <label className="text-sm font-medium">
                  ❌ Not Available
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Profile Views */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profile Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '...' : analytics?.total_views || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total profile views
              </p>
            </CardContent>
          </Card>

          {/* Likes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Likes
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '...' : analytics?.total_likes || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total likes received
              </p>
            </CardContent>
          </Card>

          {/* Shortlisted */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Shortlisted
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '...' : analytics?.total_shortlists || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Times shortlisted
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '...' : `${analytics?.conversion_rate?.toFixed(1) || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Views to shortlists
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Match Quality Stats */}
        {analytics?.match_tier_stats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Match Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.match_tier_stats.perfect_matches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Perfect Matches</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.match_tier_stats.great_matches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Great Matches</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analytics.match_tier_stats.good_matches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Good Matches</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.match_tier_stats.potential_matches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Potential Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shortlisted Clients */}
        {shortlistedClients && shortlistedClients.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Shortlisted Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shortlistedClients.slice(0, 5).map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Client #{client.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.primary_goals?.length ? `Goals: ${client.primary_goals.join(', ')}` : 'No goals specified'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {(client as any).discovery_call_booked ? 'Call Booked' : 'Available'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Additional Dashboard Grid for Sessions and Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Next 7 days
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Add Testimonial
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Update Rates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">New client inquiry from Sarah M.</p>
                  <p className="text-sm text-muted-foreground">Interested in weight loss program</p>
                </div>
                <Badge variant="secondary">2h ago</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Profile viewed by 5 potential clients</p>
                  <p className="text-sm text-muted-foreground">Your HIIT specialization is popular</p>
                </div>
                <Badge variant="secondary">1d ago</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">New 5-star review received</p>
                  <p className="text-sm text-muted-foreground">"Amazing trainer, highly recommend!"</p>
                </div>
                <Badge variant="secondary">3d ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerDashboard;