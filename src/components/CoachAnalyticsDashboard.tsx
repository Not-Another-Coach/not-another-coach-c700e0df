import { useState, useEffect } from 'react';
import { useCoachAnalytics } from '@/hooks/useCoachAnalytics';
import { useTrainerProfileContext } from '@/contexts/TrainerProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Heart, 
  Star, 
  Users, 
  TrendingUp, 
  Target,
  MessageCircle,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Dumbbell
} from 'lucide-react';

interface CoachAnalyticsDashboardProps {
  trainerId?: string;
}

export const CoachAnalyticsDashboard = ({ trainerId }: CoachAnalyticsDashboardProps) => {
  const { profile } = useTrainerProfileContext();
  const currentTrainerId = trainerId || profile?.id?.toString();
  const { analytics, shortlistedClients, shortlistedStats, loading } = useCoachAnalytics(currentTrainerId);

  // Mock data for demonstration - in real app this would come from analytics
  const mockStats = {
    total_views: 142,
    total_likes: 23,
    total_saves: 18,
    total_shortlists: 7,
    match_tier_stats: {
      perfect_matches: 8,
      great_matches: 15,
      good_matches: 12,
      potential_matches: 7
    },
    conversion_rate: 16.2
  };

  const stats = analytics || mockStats;

  if (!profile && !trainerId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Analytics are only available for trainers
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPersonalityTypes = (types?: string[]) => {
    if (!types || types.length === 0) return 'Not specified';
    return types.slice(0, 3).join(', ') + (types.length > 3 ? '...' : '');
  };

  const formatGoals = (goals?: string[]) => {
    if (!goals || goals.length === 0) return 'Not specified';
    return goals.slice(0, 2).join(', ') + (goals.length > 2 ? '...' : '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coach Analytics</h2>
          <p className="text-muted-foreground">
            Your visibility and engagement metrics
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Match Insights</TabsTrigger>
          <TabsTrigger value="clients">Client Visibility</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Profile Views</p>
                    <p className="text-2xl font-bold">{stats.total_views}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Likes/Swipes</p>
                    <p className="text-2xl font-bold">{stats.total_likes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Saves</p>
                    <p className="text-2xl font-bold">{stats.total_saves}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Shortlisted & Discovery</p>
                    <p className="text-2xl font-bold">{shortlistedStats.total}</p>
                    <p className="text-xs text-muted-foreground">+{shortlistedStats.last7Days} this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Conversion Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>View to Like Rate</span>
                    <span>{((stats.total_likes / stats.total_views) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.total_likes / stats.total_views) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Like to Save Rate</span>
                    <span>{((stats.total_saves / stats.total_likes) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.total_saves / stats.total_likes) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Save to Shortlist Rate</span>
                    <span>{((stats.total_shortlists / stats.total_saves) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.total_shortlists / stats.total_saves) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Match Tier Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.match_tier_stats?.perfect_matches || 0}
                    </div>
                    <div className="text-sm text-green-600">Perfect Matches</div>
                    <div className="text-xs text-muted-foreground mt-1">80%+ compatibility</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.match_tier_stats?.great_matches || 0}
                    </div>
                    <div className="text-sm text-blue-600">Great Matches</div>
                    <div className="text-xs text-muted-foreground mt-1">60-79% compatibility</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.match_tier_stats?.good_matches || 0}
                    </div>
                    <div className="text-sm text-purple-600">Good Matches</div>
                    <div className="text-xs text-muted-foreground mt-1">40-59% compatibility</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {stats.match_tier_stats?.potential_matches || 0}
                    </div>
                    <div className="text-sm text-gray-600">Potential Matches</div>
                    <div className="text-xs text-muted-foreground mt-1">20-39% compatibility</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Shortlisted & Discovery Clients ({shortlistedClients.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Includes clients who are shortlisted or in discovery stages
              </p>
            </CardHeader>
            <CardContent>
              {shortlistedClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No clients have shortlisted you or are in discovery stages yet
                </div>
              ) : (
                <div className="grid gap-4">
                  {shortlistedClients.map((client, index) => (
                    <Card key={client.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Client #{index + 1}</Badge>
                              <Badge variant="outline" className="text-xs">
                                {(client as any).engagement_stage?.replace('_', ' ')}
                              </Badge>
                              {(client as any).discovery_call_booked && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Discovery Call Booked
                                </Badge>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Goals:</span>
                                  <span>{formatGoals(client.primary_goals)}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Format:</span>
                                  <span>{client.training_location_preference || 'Not specified'}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Frequency:</span>
                                  <span>{client.preferred_training_frequency ? `${client.preferred_training_frequency}x/week` : 'Not specified'}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Personality:</span>
                                  <span>{formatPersonalityTypes(client.client_personality_type)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Experience:</span>
                                  <span>{client.experience_level || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>

                            {client.preferred_time_slots && client.preferred_time_slots.length > 0 && (
                              <div>
                                <span className="font-medium text-sm">Available times:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {client.preferred_time_slots.slice(0, 4).map((slot) => (
                                    <Badge key={slot} variant="outline" className="text-xs">
                                      {slot}
                                    </Badge>
                                  ))}
                                  {client.preferred_time_slots.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{client.preferred_time_slots.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Chat
                            </Button>
                            <Button size="sm" variant="default">
                              <Phone className="h-3 w-3 mr-1" />
                              Schedule Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};