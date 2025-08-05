import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { Users, MessageCircle, Calendar, Video, Phone, UserPlus } from 'lucide-react';
import { MessagingPopup } from '@/components/MessagingPopup';
import { DiscoveryCallNotesTaker } from '@/components/DiscoveryCallNotesTaker';

interface Prospect {
  id: string;
  client_id: string;
  trainer_id: string;
  stage: string;
  created_at: string;
  notes?: string;
  user_id: string; // For compatibility with MessagingPopup
  client_profile?: {
    first_name?: string;
    last_name?: string;
    primary_goals?: string[];
    training_location_preference?: string;
  };
  discovery_call?: {
    scheduled_for: string;
    duration_minutes: number;
    status: string;
  };
}

interface ProspectsSectionProps {
  onCountChange?: (count: number) => void;
}

export function ProspectsSection({ onCountChange }: ProspectsSectionProps) {
  const { profile } = useProfile();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Prospect | null>(null);

  useEffect(() => {
    if (profile?.id) {
      console.log('Profile loaded, fetching prospects for trainer:', profile.id);
      fetchProspects();
    } else {
      console.log('No profile ID available');
      setLoading(false);
      onCountChange?.(0);
    }
  }, [profile?.id, onCountChange]);

  const fetchProspects = async () => {
    if (!profile?.id) {
      console.log('No profile ID for fetching prospects');
      setLoading(false);
      return;
    }

    console.log('Starting to fetch prospects for trainer:', profile.id);
    setLoading(true);

    try {
      // Get engaged clients for this trainer (shortlisted and above)
      const { data: engagementData, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select(`
          client_id,
          trainer_id,
          stage,
          created_at,
          updated_at,
          notes
        `)
        .eq('trainer_id', profile.id)
        .in('stage', ['shortlisted', 'discovery_call_booked', 'matched', 'discovery_completed'])
        .order('created_at', { ascending: false });

      console.log('Engagement data:', engagementData);
      console.log('Engagement error:', engagementError);

      if (engagementError) {
        console.error('Error fetching engaged clients:', engagementError);
        setProspects([]);
        onCountChange?.(0);
        return;
      }

      if (!engagementData || engagementData.length === 0) {
        console.log('No engaged clients found for trainer:', profile.id);
        setProspects([]);
        onCountChange?.(0);
        return;
      }

      console.log('Found engaged clients:', engagementData.length);

      // Get client profiles and discovery calls
      const clientIds = engagementData.map(item => item.client_id);
      console.log('Client IDs to fetch:', clientIds);
      
      const [profilesResult, discoveryCallsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, primary_goals, training_location_preference')
          .in('id', clientIds),
        supabase
          .from('discovery_calls')
          .select('client_id, scheduled_for, duration_minutes, status')
          .eq('trainer_id', profile.id)
          .in('client_id', clientIds)
          .in('status', ['scheduled', 'rescheduled'])
      ]);

      const { data: profilesData, error: profilesError } = profilesResult;
      const { data: discoveryCallsData, error: discoveryCallsError } = discoveryCallsResult;

      console.log('Profiles data:', profilesData);
      console.log('Discovery calls data:', discoveryCallsData);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      if (discoveryCallsError) {
        console.error('Error fetching discovery calls data:', discoveryCallsError);
      }

      // Merge the data
      const mergedData = engagementData.map(engagement => ({
        id: `${engagement.client_id}-${engagement.trainer_id}`,
        client_id: engagement.client_id,
        user_id: engagement.client_id, // For compatibility
        trainer_id: engagement.trainer_id,
        stage: engagement.stage,
        created_at: engagement.created_at,
        notes: engagement.notes,
        client_profile: profilesData?.find(profile => profile.id === engagement.client_id) || null,
        discovery_call: discoveryCallsData?.find(call => call.client_id === engagement.client_id) || null
      }));

      console.log('Final merged prospects data:', mergedData);

      setProspects(mergedData as Prospect[]);
      onCountChange?.(mergedData.length);
    } catch (error) {
      console.error('Error in fetchProspects:', error);
      setProspects([]);
      onCountChange?.(0);
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (stage?: string, discoveryCall?: any) => {
    if (discoveryCall) {
      return { label: 'Call Scheduled', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
    }
    
    switch (stage) {
      case 'shortlisted':
        return { label: 'Shortlisted', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' };
      case 'matched':
        return { label: 'Matched', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' };
      case 'discovery_completed':
        return { label: 'Discovery Done', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: 'Prospect', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' };
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
              const stageInfo = getStageInfo(prospect.stage, prospect.discovery_call);
              
              return (
                <div key={prospect.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {prospect.client_profile?.first_name && prospect.client_profile?.last_name
                            ? `${prospect.client_profile.first_name} ${prospect.client_profile.last_name}`
                            : `Client ${prospect.client_id.slice(0, 8)}`}
                        </h4>
                        <Badge variant={stageInfo.variant} className={stageInfo.color}>
                          {stageInfo.label}
                        </Badge>
                        {prospect.stage === 'matched' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Chat Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {prospect.stage === 'shortlisted' && `Shortlisted ${format(new Date(prospect.created_at), 'MMM d, yyyy')}`}
                          {prospect.stage === 'matched' && `Matched ${format(new Date(prospect.created_at), 'MMM d, yyyy')}`}
                          {prospect.stage === 'discovery_completed' && `Discovery completed`}
                        </span>
                        {prospect.discovery_call && (
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Call scheduled for {format(new Date(prospect.discovery_call.scheduled_for), 'MMM d, yyyy \'at\' h:mm a')}
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
                    {prospect.stage === 'matched' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedClient(prospect);
                          setIsMessagingOpen(true);
                        }}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    )}
                    
                    {prospect.stage === 'shortlisted' && !prospect.discovery_call && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('Book discovery call:', prospect.client_id);
                        }}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Book Discovery Call
                      </Button>
                    )}
                    
                    {prospect.discovery_call && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('Join call:', prospect.client_id);
                        }}
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Join Call
                      </Button>
                    )}
                    
                    {prospect.stage === 'discovery_completed' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          console.log('Convert to client:', prospect.client_id);
                        }}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Convert to Client
                      </Button>
                    )}
                  </div>
                  
                  {/* Discovery Call Notes */}
                  <div className="mt-4">
                    <DiscoveryCallNotesTaker 
                      clientId={prospect.client_id}
                      clientName={prospect.client_profile?.first_name && prospect.client_profile?.last_name
                        ? `${prospect.client_profile.first_name} ${prospect.client_profile.last_name}`
                        : undefined}
                      compact={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      {/* Messaging Popup */}
      <MessagingPopup 
        isOpen={isMessagingOpen}
        onClose={() => {
          setIsMessagingOpen(false);
          setSelectedClient(null);
        }}
        selectedClient={selectedClient}
      />
    </Card>
  );
}