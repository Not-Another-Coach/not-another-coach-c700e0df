import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, Calendar, Heart, UserPlus, Star, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isYesterday } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'user_action' | 'social_proof' | 'trainer_activity';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  actionUrl?: string;
  trainerInfo?: {
    id: string;
    name: string;
    image: string;
  };
}

export function ClientActivityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityFeed();
  }, [user]);

  const loadActivityFeed = async () => {
    if (!user) return;

    try {
      const activities: ActivityItem[] = [];

      // Load user's own recent activities only - no mock data
      await loadUserActivities(activities);

      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(activities.slice(0, 10)); // Show latest 10 activities
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivities = async (activities: ActivityItem[]) => {
    // Load user's discovery calls
    const { data: discoveryCalls } = await supabase
      .from('discovery_calls')
      .select(`
        id,
        status,
        scheduled_for,
        created_at,
        trainer_id
      `)
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (discoveryCalls) {
      for (const call of discoveryCalls) {
        if (call.status === 'scheduled') {
          // Get trainer profile separately
          const { data: trainerProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, profile_photo_url')
            .eq('id', call.trainer_id)
            .single();

          if (trainerProfile) {
            activities.push({
              id: `call-${call.id}`,
              type: 'user_action',
              title: 'Discovery Call Booked',
              description: `You booked a discovery call with ${trainerProfile.first_name} ${trainerProfile.last_name} for ${format(new Date(call.scheduled_for), 'EEE MMM d, h:mm a')}`,
              timestamp: call.created_at,
              icon: <Calendar className="h-4 w-4 text-accent-600" />,
              actionUrl: `/trainer/${trainerProfile.id}`,
              trainerInfo: {
                id: trainerProfile.id,
                name: `${trainerProfile.first_name} ${trainerProfile.last_name}`,
                image: trainerProfile.profile_photo_url || '/placeholder.svg'
              }
            });
          }
        }
      }
    }

    // Load user's recent trainer engagements
    const { data: engagements } = await supabase
      .from('client_trainer_engagement')
      .select(`
        id,
        stage,
        updated_at,
        trainer_id
      `)
      .eq('client_id', user!.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (engagements) {
      for (const engagement of engagements) {
        let title = '';
        let icon: React.ReactNode;
        
        switch (engagement.stage) {
          case 'liked':
            title = 'Trainer Saved';
            icon = <Heart className="h-4 w-4 text-primary-600" />;
            break;
          case 'shortlisted':
            title = 'Trainer Shortlisted';
            icon = <Star className="h-4 w-4 text-warning-600" />;
            break;
          default:
            continue;
        }

        // Get trainer profile separately
        const { data: trainerProfile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, profile_photo_url')
          .eq('id', engagement.trainer_id)
          .single();

        if (trainerProfile) {
          activities.push({
            id: `engagement-${engagement.id}`,
            type: 'user_action',
            title,
            description: `You ${engagement.stage} ${trainerProfile.first_name} ${trainerProfile.last_name}`,
            timestamp: engagement.updated_at,
            icon,
            actionUrl: `/trainer/${trainerProfile.id}`,
            trainerInfo: {
              id: trainerProfile.id,
              name: `${trainerProfile.first_name} ${trainerProfile.last_name}`,
              image: trainerProfile.profile_photo_url || '/placeholder.svg'
            }
          });
        }
      }
    }
  };

  const loadSocialProofActivities = async (activities: ActivityItem[]) => {
    // Mock social proof data - in production this would come from aggregated user activity
    const mockSocialProof = [
      {
        id: 'social-1',
        title: 'James confirmed a package',
        description: 'James just confirmed a 6-week package with Coach Priya',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        icon: <CheckCircle className="h-4 w-4 text-success-600" />
      },
      {
        id: 'social-2', 
        title: 'Sarah saved a trainer',
        description: 'Sarah saved Coach Alex as a favorite',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        icon: <Heart className="h-4 w-4 text-primary-600" />
      },
      {
        id: 'social-3',
        title: 'Mike booked a discovery call',
        description: 'Mike booked a call with Coach Emma for tomorrow',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        icon: <Calendar className="h-4 w-4 text-accent-600" />
      }
    ];

    mockSocialProof.forEach(item => {
      activities.push({
        ...item,
        type: 'social_proof'
      });
    });
  };

  const loadTrainerActivities = async (activities: ActivityItem[]) => {
    // Mock trainer activity data - in production this would track trainer posts/updates
    const mockTrainerActivity = [
      {
        id: 'trainer-1',
        title: 'Coach Lena posted new content',
        description: 'Coach Lena posted "Top 5 Recovery Hacks"',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        icon: <TrendingUp className="h-4 w-4 text-secondary-600" />
      },
      {
        id: 'trainer-2',
        title: 'Coach Anna achieved milestone',
        description: 'Coach Anna reached 50 successful transformations',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        icon: <Award className="h-4 w-4 text-success-600" />
      }
    ];

    mockTrainerActivity.forEach(item => {
      activities.push({
        ...item,
        type: 'trainer_activity'
      });
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.actionUrl) {
      navigate(activity.actionUrl);
    } else if (activity.trainerInfo) {
      navigate(`/trainer/${activity.trainerInfo.id}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Your activity updates will appear here as you interact with trainers</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                activity.type === 'user_action' 
                  ? 'bg-primary-50 hover:bg-primary-100 cursor-pointer' 
                  : 'bg-secondary-50 hover:bg-secondary-100 cursor-pointer'
              }`}
              onClick={() => handleActivityClick(activity)}
            >
              <div className="flex-shrink-0 p-2 rounded-full bg-white">
                {activity.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatTimestamp(activity.timestamp)}
                  </Badge>
                  
                  {activity.type === 'user_action' && (
                    <Badge variant="outline" className="text-xs">
                      Your Activity
                    </Badge>
                  )}
                  
                  {activity.trainerInfo && (
                    <div className="flex items-center gap-1">
                      <img 
                        src={activity.trainerInfo.image} 
                        alt={activity.trainerInfo.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}