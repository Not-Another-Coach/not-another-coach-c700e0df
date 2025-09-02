import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useTrainerProfile } from '@/hooks/useTrainerProfile';
import { format } from 'date-fns';
import { Users, MessageCircle, Calendar, Video, Phone, UserPlus, UserMinus, TrendingUp, Clock, Star, Target } from 'lucide-react';
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
  selection_request?: {
    client_id: string;
    package_name: string;
    package_price: number;
    status: string;
    created_at: string;
  };
}

interface ProspectsSectionProps {
  onCountChange?: (count: number) => void;
}

export function ProspectsSection({ onCountChange }: ProspectsSectionProps) {
  const { profile } = useTrainerProfile();
  const [activeProspects, setActiveProspects] = useState<Prospect[]>([]);
  const [lostProspects, setLostProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Prospect | null>(null);
  const [trainerOffersDiscoveryCall, setTrainerOffersDiscoveryCall] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalActive: 0,
    discoveryCallsBooked: 0,
    awaitingPayment: 0,
    matchedProspects: 0
  });

  useEffect(() => {
    if (profile?.id) {
      console.log('Profile loaded, fetching prospects for trainer:', profile.id);
      fetchProspects();
      // Fetch trainer's discovery call settings
      fetchDiscoveryCallSettings();
    } else {
      console.log('No profile ID available');
      setLoading(false);
      onCountChange?.(0);
    }
  }, [profile?.id, onCountChange]);

  const fetchDiscoveryCallSettings = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('discovery_call_settings')
        .select('offers_discovery_call')
        .eq('trainer_id', profile.id)
        .maybeSingle();
      
      if (!error && data) {
        setTrainerOffersDiscoveryCall(data.offers_discovery_call);
      }
    } catch (error) {
      console.error('Error fetching discovery call settings:', error);
    }
  };

  const fetchProspects = async () => {
    if (!profile?.id) {
      console.log('No profile ID for fetching prospects');
      setLoading(false);
      return;
    }

    console.log('Starting to fetch prospects for trainer:', profile.id);
    setLoading(true);

    try {
      // Get all engaged clients for this trainer (both active and lost)
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
        .in('stage', ['shortlisted', 'getting_to_know_your_coach' as any, 'discovery_in_progress', 'matched', 'discovery_completed', 'declined', 'unmatched']) // Type cast needed until Supabase regenerates types
        .order('updated_at', { ascending: false });

      console.log('Engagement data:', engagementData);
      console.log('Engagement error:', engagementError);

      if (engagementError) {
        console.error('Error fetching engaged clients:', engagementError);
        setActiveProspects([]);
        setLostProspects([]);
        onCountChange?.(0);
        return;
      }

      if (!engagementData || engagementData.length === 0) {
        console.log('No engaged clients found for trainer:', profile.id);
        setActiveProspects([]);
        setLostProspects([]);
        onCountChange?.(0);
        return;
      }

      console.log('Found engaged clients:', engagementData.length);

      // Get client profiles, discovery calls, and coach selection requests
      const clientIds = engagementData.map(item => item.client_id);
      console.log('Client IDs to fetch:', clientIds);
      
      const [profilesResult, discoveryCallsResult, selectionRequestsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, primary_goals, training_location_preference')
          .in('id', clientIds),
        supabase
          .from('discovery_calls')
          .select('client_id, scheduled_for, duration_minutes, status')
          .eq('trainer_id', profile.id)
          .in('client_id', clientIds)
          .in('status', ['scheduled', 'rescheduled']),
        supabase
          .from('coach_selection_requests')
          .select('client_id, package_name, package_price, status, created_at')
          .eq('trainer_id', profile.id)
          .in('client_id', clientIds)
      ]);

      const { data: profilesData, error: profilesError } = profilesResult;
      const { data: discoveryCallsData, error: discoveryCallsError } = discoveryCallsResult;
      const { data: selectionRequestsData, error: selectionRequestsError } = selectionRequestsResult;

      console.log('Profiles data:', profilesData);
      console.log('Discovery calls data:', discoveryCallsData);
      console.log('Selection requests data:', selectionRequestsData);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      if (discoveryCallsError) {
        console.error('Error fetching discovery calls data:', discoveryCallsError);
      }

      if (selectionRequestsError) {
        console.error('Error fetching selection requests data:', selectionRequestsError);
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
        discovery_call: discoveryCallsData?.find(call => call.client_id === engagement.client_id) || null,
        selection_request: selectionRequestsData?.find(req => req.client_id === engagement.client_id) || null
      })) as Prospect[];

      // Separate active and lost prospects
      const activeStages = ['shortlisted', 'getting_to_know_your_coach', 'discovery_in_progress', 'matched', 'discovery_completed'];
      const lostStages = ['declined', 'unmatched'];
      
      const active = mergedData.filter(prospect => activeStages.includes(prospect.stage));
      const lost = mergedData.filter(prospect => lostStages.includes(prospect.stage));

      console.log('Final merged prospects data:', mergedData);
      console.log('Active prospects:', active.length);
      console.log('Lost prospects:', lost.length);

      setActiveProspects(active);
      setLostProspects(lost);
      onCountChange?.(active.length); // Count only active prospects for the main counter
      
      // Calculate statistics
      const discoveryCallsBooked = active.filter(p => p.discovery_call).length;
      const awaitingPayment = active.filter(p => p.selection_request?.status === 'awaiting_payment').length;
      const matchedProspects = active.filter(p => p.stage === 'matched').length;
      
      setStats({
        totalActive: active.length,
        discoveryCallsBooked,
        awaitingPayment,
        matchedProspects
      });
    } catch (error) {
      console.error('Error in fetchProspects:', error);
      setActiveProspects([]);
      setLostProspects([]);
      onCountChange?.(0);
      setStats({ totalActive: 0, discoveryCallsBooked: 0, awaitingPayment: 0, matchedProspects: 0 });
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
      case 'declined':
        return { label: 'Declined', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' };
      case 'unmatched':
        return { label: 'Unmatched', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Prospect', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const renderProspectsList = (prospects: Prospect[], isLostTab = false) => {
    if (prospects.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {isLostTab ? 'No lost prospects' : 'No active prospects yet'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isLostTab 
              ? 'Declined or unmatched prospects will appear here.'
              : 'When clients shortlist you or book discovery calls, they\'ll appear here.'
            }
          </p>
        </div>
      );
    }

    return (
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
                        2-Way Chat Active
                      </Badge>
                    )}
                    {prospect.selection_request && (
                      <Badge 
                        variant="outline" 
                        className={
                          prospect.selection_request.status === 'awaiting_payment'
                            ? "bg-orange-50 text-orange-700 border-orange-300"
                            : prospect.selection_request.status === 'accepted'
                            ? "bg-green-50 text-green-700 border-green-300"
                            : "bg-blue-50 text-blue-700 border-blue-300"
                        }
                      >
                        {prospect.selection_request.status === 'awaiting_payment' 
                          ? `Awaiting Payment - ${prospect.selection_request.package_name}`
                          : prospect.selection_request.status === 'accepted'
                          ? `Coach Chosen - ${prospect.selection_request.package_name}`
                          : `Package Requested - ${prospect.selection_request.package_name}`
                        }
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {prospect.stage === 'shortlisted' && `Shortlisted ${format(new Date(prospect.created_at), 'MMM d, yyyy')}`}
                      {prospect.stage === 'matched' && `Matched ${format(new Date(prospect.created_at), 'MMM d, yyyy')}`}
                      {prospect.stage === 'discovery_completed' && `Discovery completed`}
                      {prospect.stage === 'declined' && `Declined ${format(new Date(prospect.created_at), 'MMM d, yyyy')}`}
                      {prospect.stage === 'unmatched' && `Unmatched ${format(new Date(prospect.created_at), 'MMM d, yyyy')}`}
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
                   {prospect.selection_request && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-medium text-green-900">
                        Package Selected: {prospect.selection_request.package_name} - ${prospect.selection_request.package_price}
                      </p>
                      <p className="text-xs text-green-700">
                        Status: {prospect.selection_request.status} • {format(new Date(prospect.selection_request.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                   {prospect.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Notes:</strong> {prospect.notes}
                    </p>
                  )}
                </div>
              </div>
              
              {!isLostTab && (
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
                  
                  {prospect.stage === 'shortlisted' && !prospect.discovery_call && trainerOffersDiscoveryCall && (
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
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log('View profile:', prospect.client_id);
                    }}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    View Profile
                  </Button>
                </div>
              )}
              
              {/* Discovery Call Notes - only show for non-lost prospects */}
              {!isLostTab && (
                <div className="mt-4">
                  <DiscoveryCallNotesTaker 
                    clientId={prospect.client_id}
                    clientName={prospect.client_profile?.first_name && prospect.client_profile?.last_name
                      ? `${prospect.client_profile.first_name} ${prospect.client_profile.last_name}`
                      : undefined}
                    compact={true}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Prospect Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalActive}
              </div>
              <p className="text-sm font-medium text-blue-800">Active Prospects</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.discoveryCallsBooked}
              </div>
              <p className="text-sm font-medium text-green-800">Discovery Calls</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.matchedProspects}
              </div>
              <p className="text-sm font-medium text-purple-800">Matched</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.awaitingPayment}
              </div>
              <p className="text-sm font-medium text-orange-800">Awaiting Payment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prospects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Prospects & Discovery Calls ({activeProspects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active ({activeProspects.length})
              </TabsTrigger>
              <TabsTrigger value="lost" className="flex items-center gap-2">
                <UserMinus className="w-4 h-4" />
                Lost ({lostProspects.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              {renderProspectsList(activeProspects, false)}
            </TabsContent>
            
            <TabsContent value="lost" className="mt-4">
              {renderProspectsList(lostProspects, true)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Messaging Popup */}
      {selectedClient && (
        <MessagingPopup 
          isOpen={isMessagingOpen}
          onClose={() => {
            setIsMessagingOpen(false);
            setSelectedClient(null);
          }}
          selectedClient={selectedClient}
        />
      )}
    </div>
  );
}