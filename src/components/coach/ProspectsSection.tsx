import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { Users, MessageCircle, Calendar, Video, Phone, UserPlus } from 'lucide-react';

interface Prospect {
  id: string;
  user_id: string;
  trainer_id: string;
  shortlisted_at: string;
  discovery_call_enabled: boolean;
  discovery_call_booked_at?: string;
  chat_enabled: boolean;
  notes?: string;
  client_profile?: {
    first_name?: string;
    last_name?: string;
    primary_goals?: string[];
    training_location_preference?: string;
  };
  engagement_stage?: string;
}

export function ProspectsSection() {
  const { profile } = useProfile();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchProspects();
    }
  }, [profile?.id]);

  const fetchProspects = async () => {
    if (!profile?.id) return;

    try {
      // Get shortlisted clients for this trainer
      const { data: shortlistedData, error: shortlistedError } = await supabase
        .from('shortlisted_trainers')
        .select('*')
        .eq('trainer_id', profile.id.toString())
        .order('shortlisted_at', { ascending: false });

      if (shortlistedError) {
        console.error('Error fetching shortlisted clients:', shortlistedError);
        return;
      }

      if (!shortlistedData || shortlistedData.length === 0) {
        setProspects([]);
        return;
      }

      // Get client profiles and engagement stages
      const clientIds = shortlistedData.map(item => item.user_id);
      
      const [profilesResult, engagementResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, primary_goals, training_location_preference')
          .in('id', clientIds),
        supabase
          .from('client_trainer_engagement')
          .select('client_id, stage')
          .eq('trainer_id', profile.id)
          .in('client_id', clientIds)
      ]);

      const { data: profilesData, error: profilesError } = profilesResult;
      const { data: engagementData, error: engagementError } = engagementResult;

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      if (engagementError) {
        console.error('Error fetching engagement data:', engagementError);
      }

      // Filter out clients who are already active clients
      const filteredShortlisted = shortlistedData.filter(item => {
        const engagement = engagementData?.find(eng => eng.client_id === item.user_id);
        return !engagement || engagement.stage !== 'active_client';
      });

      // Merge the data
      const mergedData = filteredShortlisted.map(shortlisted => ({
        ...shortlisted,
        client_profile: profilesData?.find(profile => profile.id === shortlisted.user_id) || null,
        engagement_stage: engagementData?.find(eng => eng.client_id === shortlisted.user_id)?.stage || 'browsing'
      }));

      setProspects(mergedData as Prospect[]);
    } catch (error) {
      console.error('Error fetching prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (stage?: string, discoveryCallEnabled?: boolean, discoveryCallBooked?: string) => {
    if (discoveryCallBooked) {
      return { label: 'Call Booked', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
    }
    if (discoveryCallEnabled) {
      return { label: 'Call Available', variant: 'secondary' as const, color: 'bg-green-100 text-green-800' };
    }
    
    switch (stage) {
      case 'liked':
        return { label: 'Liked', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' };
      case 'matched':
        return { label: 'Matched', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' };
      case 'discovery_completed':
        return { label: 'Discovery Done', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: 'Shortlisted', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Prospects & Discovery Calls ({prospects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prospects.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No prospects yet</h3>
            <p className="text-sm text-muted-foreground">
              When clients shortlist you or book discovery calls, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prospects.map((prospect) => {
              const stageInfo = getStageInfo(
                prospect.engagement_stage, 
                prospect.discovery_call_enabled, 
                prospect.discovery_call_booked_at
              );
              
              return (
                <div key={prospect.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {prospect.client_profile?.first_name && prospect.client_profile?.last_name
                            ? `${prospect.client_profile.first_name} ${prospect.client_profile.last_name}`
                            : `Client ${prospect.user_id.slice(0, 8)}`}
                        </h4>
                        <Badge variant={stageInfo.variant} className={stageInfo.color}>
                          {stageInfo.label}
                        </Badge>
                        {prospect.chat_enabled && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Chat Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Shortlisted {format(new Date(prospect.shortlisted_at), 'MMM d, yyyy')}
                        </span>
                        {prospect.discovery_call_booked_at && (
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Call booked {format(new Date(prospect.discovery_call_booked_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      {prospect.client_profile?.primary_goals && prospect.client_profile.primary_goals.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Goals:</strong> {prospect.client_profile.primary_goals.join(', ')}
                        </p>
                      )}
                      {prospect.client_profile?.training_location_preference && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Location Preference:</strong> {prospect.client_profile.training_location_preference}
                        </p>
                      )}
                      {prospect.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Notes:</strong> {prospect.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {prospect.chat_enabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement messaging functionality
                          console.log('Message prospect:', prospect.user_id);
                        }}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    )}
                    
                    {prospect.discovery_call_enabled && !prospect.discovery_call_booked_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement discovery call booking
                          console.log('Book discovery call:', prospect.user_id);
                        }}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Book Discovery Call
                      </Button>
                    )}
                    
                    {prospect.discovery_call_booked_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement join call functionality
                          console.log('Join call:', prospect.user_id);
                        }}
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Join Call
                      </Button>
                    )}
                    
                    {prospect.engagement_stage === 'discovery_completed' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          // TODO: Implement convert to client functionality
                          console.log('Convert to client:', prospect.user_id);
                        }}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Convert to Client
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}