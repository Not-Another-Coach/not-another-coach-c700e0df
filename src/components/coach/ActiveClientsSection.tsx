import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { Users, MessageCircle, Calendar, UserCheck } from 'lucide-react';
import { DiscoveryCallNotesTaker } from '@/components/DiscoveryCallNotesTaker';
import { MessagingPopup } from '@/components/MessagingPopup';

interface ActiveClient {
  id: string;
  client_id: string;
  trainer_id: string;
  stage: string;
  became_client_at: string;
  notes?: string;
  client_profile?: {
    first_name?: string;
    last_name?: string;
    primary_goals?: string[];
    training_location_preference?: string;
  };
}

interface ActiveClientsSectionProps {
  onCountChange?: (count: number) => void;
}

export function ActiveClientsSection({ onCountChange }: ActiveClientsSectionProps) {
  const { profile } = useProfile();
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagingPopupOpen, setMessagingPopupOpen] = useState(false);
  const [selectedClientForMessaging, setSelectedClientForMessaging] = useState<any>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchActiveClients();
    } else {
      setLoading(false);
    }
  }, [profile?.id]);

  const fetchActiveClients = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // First get the engagement data
      const { data: engagementData, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('*')
        .eq('trainer_id', profile.id)
        .eq('stage', 'active_client')
        .order('became_client_at', { ascending: false });

      if (engagementError) {
        console.error('Error fetching engagement data:', engagementError);
        setActiveClients([]);
        onCountChange?.(0);
        return;
      }

      if (!engagementData || engagementData.length === 0) {
        setActiveClients([]);
        onCountChange?.(0);
        return;
      }

      // Get client profiles for these engagements
      const clientIds = engagementData.map(eng => eng.client_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, primary_goals, training_location_preference')
        .in('id', clientIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Merge the data
      const mergedData = engagementData.map(engagement => ({
        ...engagement,
        client_profile: profilesData?.find(profile => profile.id === engagement.client_id) || null
      }));

      setActiveClients(mergedData as ActiveClient[]);
      onCountChange?.(mergedData.length);
    } catch (error) {
      console.error('Error fetching active clients:', error);
    } finally {
      setLoading(false);
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
          <UserCheck className="w-5 h-5" />
          Active Clients ({activeClients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeClients.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No active clients yet</h3>
            <p className="text-sm text-muted-foreground">
              When clients sign up and start training with you, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {client.client_profile?.first_name && client.client_profile?.last_name
                          ? `${client.client_profile.first_name} ${client.client_profile.last_name}`
                          : `Client ${client.client_id.slice(0, 8)}`}
                      </h4>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active Client
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Started {format(new Date(client.became_client_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {client.client_profile?.primary_goals && client.client_profile.primary_goals.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Goals:</strong> {client.client_profile.primary_goals.join(', ')}
                      </p>
                    )}
                    {client.client_profile?.training_location_preference && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Location Preference:</strong> {client.client_profile.training_location_preference}
                      </p>
                    )}
                    {client.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Notes:</strong> {client.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedClientForMessaging({
                        id: client.client_id,
                        user_id: client.client_id,
                        client_profile: client.client_profile
                      });
                      setMessagingPopupOpen(true);
                    }}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement view profile functionality
                      console.log('View profile:', client.client_id);
                    }}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    View Profile
                  </Button>
                </div>
                
                {/* Discovery Call Notes */}
                <div className="mt-4">
                  <DiscoveryCallNotesTaker 
                    clientId={client.client_id}
                    clientName={client.client_profile?.first_name && client.client_profile?.last_name
                      ? `${client.client_profile.first_name} ${client.client_profile.last_name}`
                      : undefined}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <MessagingPopup
        isOpen={messagingPopupOpen}
        onClose={() => {
          setMessagingPopupOpen(false);
          setSelectedClientForMessaging(null);
        }}
        selectedClient={selectedClientForMessaging}
      />
    </Card>
  );
}