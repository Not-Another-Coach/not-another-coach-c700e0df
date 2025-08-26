import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Video, 
  UserCheck, 
  UserPlus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table, 
  Eye,
  ChevronDown,
  Star,
  MapPin,
  Target,
  Package,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { MessagingPopup } from '@/components/MessagingPopup';

type ClientStatus = 'active' | 'prospect' | 'inactive' | 'completed';
type ViewMode = 'card' | 'table';

interface ClientRecord {
  id: string;
  client_id: string;
  name: string;
  status: ClientStatus;
  stage: string;
  primary_goals: string[];
  program_package?: string;
  start_date?: string;
  location_preference?: string;
  prospect_source?: string;
  progress?: number;
  last_activity?: string;
  
  notes?: string;
  selection_request?: {
    package_name: string;
    package_price: number;
    status: string;
  };
  discovery_call?: {
    scheduled_for: string;
    status: string;
  };
}

interface SummaryStats {
  totalActive: number;
  totalProspects: number;
  totalCompleted: number;
  totalInactive: number;
}

interface ClientProspectSummaryProps {
  onActiveClientsCountChange?: (count: number) => void;
  onProspectsCountChange?: (count: number) => void;
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-300', icon: UserCheck },
  prospect: { label: 'Prospect', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: Users },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: UserCheck },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Users }
} as const;

const GOAL_COLORS = {
  'weight loss': 'bg-pink-100 text-pink-800',
  'strength training': 'bg-purple-100 text-purple-800',
  'muscle building': 'bg-blue-100 text-blue-800',
  'general fitness': 'bg-green-100 text-green-800',
  'sports performance': 'bg-orange-100 text-orange-800',
  'rehabilitation': 'bg-red-100 text-red-800',
  'endurance': 'bg-teal-100 text-teal-800',
  'flexibility': 'bg-yellow-100 text-yellow-800',
} as const;

export function ClientProspectSummary({ onActiveClientsCountChange, onProspectsCountChange }: ClientProspectSummaryProps) {
  const { profile } = useProfile();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'start_date' | 'progress'>('name');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [messagingOpen, setMessagingOpen] = useState(false);

  // Fetch all client and prospect data
  useEffect(() => {
    if (profile?.id) {
      fetchClientData();
    }
  }, [profile?.id]);

  const fetchClientData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      // Get all engagement data
      const { data: engagements, error: engagementError } = await supabase
        .from('client_trainer_engagement')
        .select('*')
        .eq('trainer_id', profile.id)
        .in('stage', ['active_client', 'shortlisted', 'discovery_call_booked', 'discovery_in_progress', 'matched', 'discovery_completed', 'declined', 'unmatched']);

      if (engagementError) {
        console.error('Error fetching engagements:', engagementError);
        return;
      }

      if (!engagements?.length) {
        setClients([]);
        return;
      }

      // Get client profiles
      const clientIds = engagements.map(e => e.client_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, primary_goals, training_location_preference')
        .in('id', clientIds);

      // Get selection requests
      const { data: selections, error: selectionsError } = await supabase
        .from('coach_selection_requests')
        .select('client_id, package_name, package_price, status')
        .eq('trainer_id', profile.id)
        .in('client_id', clientIds);

      // Get discovery calls
      const { data: discoveryCalls, error: callsError } = await supabase
        .from('discovery_calls')
        .select('client_id, scheduled_for, status')
        .eq('trainer_id', profile.id)
        .in('client_id', clientIds);

      if (profilesError || selectionsError || callsError) {
        console.error('Error fetching related data:', { profilesError, selectionsError, callsError });
      }

      // Merge all data into ClientRecord format
      const clientRecords: ClientRecord[] = engagements.map(engagement => {
        const profile = profiles?.find(p => p.id === engagement.client_id);
        const selection = selections?.find(s => s.client_id === engagement.client_id);
        const discovery = discoveryCalls?.find(d => d.client_id === engagement.client_id);

        // Determine status based on stage
        let status: ClientStatus = 'prospect';
        if (engagement.stage === 'active_client') {
          status = 'active';
        } else if (engagement.stage === 'declined' || engagement.stage === 'unmatched') {
          status = 'inactive';
        }

        return {
          id: `${engagement.client_id}-${engagement.trainer_id}`,
          client_id: engagement.client_id,
          name: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : `Client ${engagement.client_id.slice(0, 8)}`,
          status,
          stage: engagement.stage,
          primary_goals: profile?.primary_goals || [],
          program_package: selection?.package_name,
          start_date: engagement.became_client_at || engagement.created_at,
          location_preference: profile?.training_location_preference,
          prospect_source: 'Platform', // Could be enhanced with actual source tracking
          progress: status === 'active' ? Math.floor(Math.random() * 100) : undefined, // Placeholder
          last_activity: engagement.updated_at,
          notes: engagement.notes,
          selection_request: selection ? {
            package_name: selection.package_name,
            package_price: selection.package_price,
            status: selection.status
          } : undefined,
          discovery_call: discovery ? {
            scheduled_for: discovery.scheduled_for,
            status: discovery.status
          } : undefined
        };
      });

      setClients(clientRecords);

      // Update parent counts
      const activeCount = clientRecords.filter(c => c.status === 'active').length;
      const prospectCount = clientRecords.filter(c => c.status === 'prospect').length;
      
      onActiveClientsCountChange?.(activeCount);
      onProspectsCountChange?.(prospectCount);

    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const summaryStats = useMemo((): SummaryStats => ({
    totalActive: clients.filter(c => c.status === 'active').length,
    totalProspects: clients.filter(c => c.status === 'prospect').length,
    totalCompleted: clients.filter(c => c.status === 'completed').length,
    totalInactive: clients.filter(c => c.status === 'inactive').length,
  }), [clients]);

  const uniqueGoals = useMemo(() => {
    const goals = new Set<string>();
    clients.forEach(client => {
      client.primary_goals.forEach(goal => goals.add(goal));
    });
    return Array.from(goals).sort();
  }, [clients]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    clients.forEach(client => {
      if (client.location_preference) locations.add(client.location_preference);
    });
    return Array.from(locations).sort();
  }, [clients]);

  const filteredAndSortedClients = useMemo(() => {
    let filtered = [...clients];

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(term) ||
        client.primary_goals.some(goal => goal.toLowerCase().includes(term)) ||
        client.program_package?.toLowerCase().includes(term) ||
        client.location_preference?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    if (goalFilter !== 'all') {
      filtered = filtered.filter(client => client.primary_goals.includes(goalFilter));
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(client => client.location_preference === locationFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'start_date':
          return new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime();
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [clients, searchTerm, statusFilter, goalFilter, locationFilter, sortBy]);

  const toggleCardExpansion = (clientId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusBadge = (status: ClientStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getGoalTags = (goals: string[]) => {
    return goals.slice(0, 3).map(goal => (
      <Badge 
        key={goal} 
        variant="secondary" 
        className={cn("text-xs", GOAL_COLORS[goal as keyof typeof GOAL_COLORS] || 'bg-gray-100 text-gray-800')}
      >
        {goal}
      </Badge>
    ));
  };

  const handleMessageClient = (client: ClientRecord) => {
    setSelectedClient(client);
    setMessagingOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-10 bg-muted rounded"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Client & Prospect Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {summaryStats.totalActive}
              </div>
              <p className="text-sm font-medium text-green-800">Total Active Clients</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {summaryStats.totalProspects}
              </div>
              <p className="text-sm font-medium text-orange-800">Total Prospects</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {summaryStats.totalCompleted}
              </div>
              <p className="text-sm font-medium text-blue-800">Total Completed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-3xl font-bold text-gray-600 mb-2">
                {summaryStats.totalInactive}
              </div>
              <p className="text-sm font-medium text-gray-800">Total Inactive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients and prospects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClientStatus | 'all')}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={goalFilter} onValueChange={setGoalFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  {uniqueGoals.map(goal => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="start_date">Date</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
            Showing {filteredAndSortedClients.length} of {clients.length} records
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <Card>
        <CardContent className="p-6">
          {filteredAndSortedClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No clients or prospects found
              </h3>
              <p className="text-sm text-muted-foreground">
                {clients.length === 0 
                  ? 'When clients shortlist you or become active clients, they\'ll appear here.'
                  : 'Try adjusting your filters or search term.'
                }
              </p>
            </div>
          ) : viewMode === 'card' ? (
            <CardView 
              clients={filteredAndSortedClients}
              expandedCards={expandedCards}
              onToggleExpansion={toggleCardExpansion}
              onMessageClient={handleMessageClient}
              getStatusBadge={getStatusBadge}
              getGoalTags={getGoalTags}
            />
          ) : (
            <TableView 
              clients={filteredAndSortedClients}
              onMessageClient={handleMessageClient}
              getStatusBadge={getStatusBadge}
              getGoalTags={getGoalTags}
            />
          )}
        </CardContent>
      </Card>

      {/* Messaging Popup */}
      {selectedClient && (
        <MessagingPopup
          isOpen={messagingOpen}
          onClose={() => {
            setMessagingOpen(false);
            setSelectedClient(null);
          }}
          selectedClient={{
            id: selectedClient.client_id,
            user_id: selectedClient.client_id,
            client_profile: {
              first_name: selectedClient.name.split(' ')[0],
              last_name: selectedClient.name.split(' ')[1] || '',
              primary_goals: selectedClient.primary_goals,
              training_location_preference: selectedClient.location_preference,
            },
          }}
        />
      )}
    </div>
  );
}

// Card View Component
function CardView({ 
  clients, 
  expandedCards, 
  onToggleExpansion, 
  onMessageClient, 
  getStatusBadge, 
  getGoalTags 
}: {
  clients: ClientRecord[];
  expandedCards: Set<string>;
  onToggleExpansion: (id: string) => void;
  onMessageClient: (client: ClientRecord) => void;
  getStatusBadge: (status: ClientStatus) => JSX.Element;
  getGoalTags: (goals: string[]) => JSX.Element[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => {
        const isExpanded = expandedCards.has(client.id);
        const StatusIcon = STATUS_CONFIG[client.status].icon;
        
        return (
          <div 
            key={client.id} 
            className={cn(
              "border rounded-lg p-4 space-y-3 transition-all hover:shadow-md",
              client.status === 'active' && "border-green-200 bg-green-50/50",
              client.status === 'prospect' && "border-orange-200 bg-orange-50/50",
              client.status === 'completed' && "border-blue-200 bg-blue-50/50",
              client.status === 'inactive' && "border-gray-200 bg-gray-50/50"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium cursor-pointer hover:text-primary" title="View Profile">
                    {client.name}
                  </h4>
                  {getStatusBadge(client.status)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {getGoalTags(client.primary_goals)}
                </div>
              </div>
              <StatusIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>

            {/* Program/Package Info */}
            {client.program_package && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{client.program_package}</span>
              </div>
            )}

            {/* Progress for Active Clients */}
            {client.status === 'active' && client.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{client.progress}%</span>
                </div>
                <Progress value={client.progress} className="h-2" />
              </div>
            )}

            {/* Collapsible Secondary Details */}
            <Collapsible open={isExpanded} onOpenChange={() => onToggleExpansion(client.id)}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
                  <span className="text-sm text-muted-foreground">
                    {isExpanded ? 'Show less' : 'Show details'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {client.start_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {client.status === 'active' ? 'Started' : 'Joined'} {format(new Date(client.start_date), 'MMM d, yyyy')}
                  </div>
                )}
                {client.location_preference && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {client.location_preference}
                  </div>
                )}
                {client.prospect_source && client.status === 'prospect' && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Source:</strong> {client.prospect_source}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {(client.status === 'active' || client.stage === 'matched') && (
                <Button size="sm" variant="outline" onClick={() => onMessageClient(client)}>
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Message
                </Button>
              )}
              
              <Button size="sm" variant="outline">
                <Eye className="w-3 h-3 mr-1" />
                View Profile
              </Button>

              {client.status === 'prospect' && client.stage === 'discovery_completed' && (
                <Button size="sm" variant="default">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Convert
                </Button>
              )}

              {client.status === 'active' && (
                <Button size="sm" variant="outline">
                  <Target className="w-3 h-3 mr-1" />
                  Assign Template
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Table View Component
function TableView({ 
  clients, 
  onMessageClient, 
  getStatusBadge, 
  getGoalTags 
}: {
  clients: ClientRecord[];
  onMessageClient: (client: ClientRecord) => void;
  getStatusBadge: (status: ClientStatus) => JSX.Element;
  getGoalTags: (goals: string[]) => JSX.Element[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium">Name</th>
            <th className="text-left py-3 px-2 font-medium">Status</th>
            <th className="text-left py-3 px-2 font-medium">Goals</th>
            <th className="text-left py-3 px-2 font-medium">Program</th>
            <th className="text-left py-3 px-2 font-medium">Date</th>
            <th className="text-left py-3 px-2 font-medium">Progress</th>
            <th className="text-left py-3 px-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-2">
                <div className="font-medium cursor-pointer hover:text-primary" title="View Profile">
                  {client.name}
                </div>
              </td>
              <td className="py-3 px-2">
                {getStatusBadge(client.status)}
              </td>
              <td className="py-3 px-2">
                <div className="flex flex-wrap gap-1">
                  {getGoalTags(client.primary_goals).slice(0, 2)}
                  {client.primary_goals.length > 2 && (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                      +{client.primary_goals.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 text-sm">
                {client.program_package || '-'}
              </td>
              <td className="py-3 px-2 text-sm text-muted-foreground">
                {client.start_date ? format(new Date(client.start_date), 'MMM d, yyyy') : '-'}
              </td>
              <td className="py-3 px-2">
                {client.status === 'active' && client.progress !== undefined ? (
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={client.progress} className="h-2 flex-1" />
                    <span className="text-xs font-medium">{client.progress}%</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </td>
              <td className="py-3 px-2">
                <div className="flex gap-1">
                  {(client.status === 'active' || client.stage === 'matched') && (
                    <Button size="sm" variant="outline" onClick={() => onMessageClient(client)}>
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}