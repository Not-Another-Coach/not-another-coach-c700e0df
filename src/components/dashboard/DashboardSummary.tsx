import { useNavigate } from "react-router-dom";
import { useEnhancedTrainerMatching } from "@/hooks/useEnhancedTrainerMatching";
import { useSavedTrainers } from "@/hooks/useSavedTrainers";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useConversations } from "@/hooks/useConversations";
import { useRealTrainers } from "@/hooks/useRealTrainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NewsAlertsSection } from "@/components/dashboard/NewsAlertsSection";
import { DiscoveryCallNotificationsWidget } from "@/components/dashboard/DiscoveryCallNotificationsWidget";
import { 
  Heart, 
  Settings, 
  Search, 
  MessageCircle, 
  Star, 
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Target,
  Phone,
  Calendar,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { MessagingService } from "@/services/messaging";

interface DashboardSummaryProps {
  profile: any;
  onTabChange: (tab: string) => void;
}

export function DashboardSummary({ profile, onTabChange }: DashboardSummaryProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trainers: realTrainers, loading: trainersLoading } = useRealTrainers();
  const { savedTrainers, savedTrainerIds } = useSavedTrainers();
  const { shortlistedTrainers, shortlistCount } = useShortlistedTrainers();
  const { conversations } = useConversations();
  
  const [discoveryCallsData, setDiscoveryCallsData] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });

  // Get enhanced matched trainers using client survey data
  const clientSurveyData = {
    primary_goals: profile.primary_goals,
    secondary_goals: profile.secondary_goals,
    training_location_preference: profile.training_location_preference,
    open_to_virtual_coaching: profile.open_to_virtual_coaching,
    preferred_training_frequency: profile.preferred_training_frequency,
    preferred_time_slots: profile.preferred_time_slots,
    start_timeline: profile.start_timeline,
    preferred_coaching_style: profile.preferred_coaching_style,
    motivation_factors: profile.motivation_factors,
    client_personality_type: profile.client_personality_type,
    experience_level: profile.experience_level,
    preferred_package_type: profile.preferred_package_type,
    budget_range_min: profile.budget_range_min,
    budget_range_max: profile.budget_range_max,
    budget_flexibility: profile.budget_flexibility,
    waitlist_preference: profile.waitlist_preference,
    flexible_scheduling: profile.flexible_scheduling,
  };

  const { matchedTrainers, topMatches } = useEnhancedTrainerMatching(
    realTrainers, 
    profile.quiz_answers,
    clientSurveyData
  );

  // Load discovery calls data using MessagingService
  useEffect(() => {
    const loadDiscoveryCallsData = async () => {
      if (!user) return;

      const response = await MessagingService.getDiscoveryCallsSummary(user.id);
      
      if (response.success && response.data) {
        setDiscoveryCallsData(response.data);
      }
    };

    loadDiscoveryCallsData();
  }, [user]);

  // Handler to navigate to My Trainers with specific filter
  const navigateToMyTrainers = (filter: 'all' | 'saved' | 'shortlisted' | 'discovery') => {
    onTabChange('my-trainers');
    // Use a small delay to ensure tab change happens first
    setTimeout(() => {
      const event = new CustomEvent('setMyTrainersFilter', { 
        detail: { filter } 
      });
      window.dispatchEvent(event);
      
      // Also trigger a data refresh to ensure latest data is shown
      window.dispatchEvent(new CustomEvent('refreshMyTrainersData'));
    }, 100);
  };

  // Calculate profile completion for clients
  const calculateProfileCompletion = () => {
    const requiredFields = [
      'primary_goals',
      'training_location_preference', 
      'preferred_training_frequency',
      'preferred_time_slots',
      'preferred_coaching_style',
      'client_personality_type',
      'preferred_package_type'
    ];
    
    const completedFields = requiredFields.filter(field => profile[field] && 
      (Array.isArray(profile[field]) ? profile[field].length > 0 : true)
    ).length;
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="space-y-6">
      {/* Profile Completion Card */}
      {profileCompletion < 100 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-amber-800">Complete Your Profile</h3>
                <p className="text-sm text-amber-700">
                  Get better trainer matches by completing your preferences
                </p>
              </div>
              <div className="text-2xl font-bold text-amber-800">{profileCompletion}%</div>
            </div>
            <Progress value={profileCompletion} className="w-full mb-4" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTabChange('preferences')}
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top Matches */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
          onClick={() => onTabChange('explore')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-blue-500 text-white">
                <Target className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900 mb-1">Top Matches</h3>
            <div className="text-3xl font-bold text-blue-700 mb-2">{topMatches.length}</div>
            <p className="text-sm text-blue-600">Discover your perfect trainers</p>
          </CardContent>
        </Card>

        {/* Saved Trainers */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100"
          onClick={() => navigateToMyTrainers('saved')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-pink-500 text-white">
                <Heart className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="font-semibold text-pink-900 mb-1">Saved Trainers</h3>
            <div className="text-3xl font-bold text-pink-700 mb-2">{savedTrainers.length}</div>
            <p className="text-sm text-pink-600">Your liked trainers</p>
          </CardContent>
        </Card>

        {/* Shortlisted Trainers */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100"
          onClick={() => navigateToMyTrainers('shortlisted')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-yellow-500 text-white">
                <Star className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-yellow-900 mb-1">Shortlisted</h3>
            <div className="text-3xl font-bold text-yellow-700 mb-2">{shortlistCount}/4</div>
            <p className="text-sm text-yellow-600">Ready to connect</p>
          </CardContent>
        </Card>

        {/* Active Conversations */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-green-200 bg-gradient-to-br from-green-50 to-green-100"
          onClick={() => navigateToMyTrainers('discovery')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-green-500 text-white">
                <MessageCircle className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-900 mb-1">Active Chats</h3>
            <div className="text-3xl font-bold text-green-700 mb-2">{conversations.length}</div>
            <p className="text-sm text-green-600">Ongoing conversations</p>
          </CardContent>
        </Card>
      </div>

      {/* Discovery Calls Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Discovery Calls Summary */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100"
          onClick={() => navigateToMyTrainers('discovery')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-purple-500 text-white">
                <Phone className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-4">Discovery Calls</h3>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-purple-700">{discoveryCallsData.scheduled}</div>
                <p className="text-xs text-purple-600">Scheduled</p>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-700">{discoveryCallsData.completed}</div>
                <p className="text-xs text-purple-600">Completed</p>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-700">{discoveryCallsData.cancelled}</div>
                <p className="text-xs text-purple-600">Cancelled</p>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-700">{discoveryCallsData.total}</div>
                <p className="text-xs text-purple-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discovery Call Notifications Widget */}
        <DiscoveryCallNotificationsWidget />
      </div>

      {/* Top Matches Preview */}
      {topMatches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Top Matches Preview
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onTabChange('explore')}
              >
                Explore All →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {topMatches.slice(0, 3).map((match) => (
                <div key={match.trainer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <img 
                      src={match.trainer.image || '/placeholder.svg'} 
                      alt={match.trainer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="flex items-center gap-2 cursor-pointer group/name"
                          onClick={() => navigate(`/trainer/${match.trainer.id}`)}
                          title="View trainer profile"
                        >
                          <h3 className="font-semibold group-hover/name:text-primary transition-colors">{match.trainer.name}</h3>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/name:text-primary transition-colors opacity-0 group-hover/name:opacity-100" />
                        </div>
                        <Badge variant="secondary">
                          {match.score}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {match.trainer.specialties?.slice(0, 2).join(' • ') || 'Personal Training'}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Open messaging popup
                            const event = new CustomEvent('openMessagePopup', {
                              detail: { trainerId: match.trainer.id }
                            });
                            window.dispatchEvent(event);
                          }}
                        >
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* News & Alerts Section */}
      <NewsAlertsSection />
    </div>
  );
}