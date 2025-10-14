import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, User, Star, Plus, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDiscoveryCallNotifications } from '@/hooks/useDiscoveryCallNotifications';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ManageDiscoveryCallModal } from '@/components/discovery-call/ManageDiscoveryCallModal';

interface CalendarSession {
  id: string;
  time: string;
  client: string;
  type: 'discovery' | 'training' | 'open';
  status: 'confirmed' | 'pending' | 'open';
  scheduledFor: Date;
}

export const TrainerCalendar = () => {
  const { user } = useAuth();
  const { upcomingCalls, loading } = useDiscoveryCallNotifications();
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    activeClients: 0,
    sessionsThisWeek: 0,
    averageRating: 0
  });
  
  // State for managing discovery call modal
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; profilePhotoUrl?: string } | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchStats();
    }
  }, [user, weekStart]);

  const fetchSessions = async () => {
    if (!user) return;
    
    const weekEnd = addDays(weekStart, 7);
    const allSessions: CalendarSession[] = [];

    // Fetch discovery calls (exclude cancelled)
    const { data: discoveryCalls } = await supabase
      .from('discovery_calls')
      .select(`
        id,
        scheduled_for,
        status,
        profiles!discovery_calls_client_id_fkey(first_name, last_name)
      `)
      .eq('trainer_id', user.id)
      .gte('scheduled_for', weekStart.toISOString())
      .lte('scheduled_for', weekEnd.toISOString())
      .neq('status', 'cancelled')
      .order('scheduled_for', { ascending: true });

    if (discoveryCalls) {
      discoveryCalls.forEach((call: any) => {
        allSessions.push({
          id: call.id,
          time: format(new Date(call.scheduled_for), 'h:mm a'),
          client: `${call.profiles?.first_name || 'Unknown'} ${call.profiles?.last_name || ''}`.trim(),
          type: 'discovery',
          status: call.status === 'scheduled' ? 'confirmed' : 'pending',
          scheduledFor: new Date(call.scheduled_for)
        });
      });
    }

    // Fetch activity appointments (training sessions)
    const { data: appointments } = await supabase
      .from('activity_appointments')
      .select(`
        id,
        scheduled_at,
        status,
        profiles!activity_appointments_client_id_fkey(first_name, last_name)
      `)
      .eq('trainer_id', user.id)
      .gte('scheduled_at', weekStart.toISOString())
      .lte('scheduled_at', weekEnd.toISOString())
      .order('scheduled_at', { ascending: true });

    if (appointments) {
      appointments.forEach((apt: any) => {
        allSessions.push({
          id: apt.id,
          time: format(new Date(apt.scheduled_at), 'h:mm a'),
          client: `${apt.profiles?.first_name || 'Unknown'} ${apt.profiles?.last_name || ''}`.trim(),
          type: 'training',
          status: apt.status === 'scheduled' ? 'confirmed' : 'pending',
          scheduledFor: new Date(apt.scheduled_at)
        });
      });
    }

    // Sort by time
    allSessions.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    setSessions(allSessions);
  };

  const fetchStats = async () => {
    if (!user) return;

    // Get active clients count
    const { count: activeCount } = await supabase
      .from('client_trainer_engagement')
      .select('*', { count: 'exact', head: true })
      .eq('trainer_id', user.id)
      .eq('stage', 'active_client');

    // Get sessions this week count
    const weekEnd = addDays(weekStart, 7);
    const { count: sessionsCount } = await supabase
      .from('activity_appointments')
      .select('*', { count: 'exact', head: true })
      .eq('trainer_id', user.id)
      .gte('scheduled_at', weekStart.toISOString())
      .lte('scheduled_at', weekEnd.toISOString());

    // Get average rating from feedback
    const { data: feedback } = await supabase
      .from('discovery_call_feedback')
      .select('overall_rating')
      .eq('trainer_id', user.id)
      .not('overall_rating', 'is', null);

    let avgRating = 0;
    if (feedback && feedback.length > 0) {
      const sum = feedback.reduce((acc: number, curr: any) => acc + (curr.overall_rating || 0), 0);
      avgRating = Math.round((sum / feedback.length) * 10) / 10;
    }

    setStats({
      activeClients: activeCount || 0,
      sessionsThisWeek: sessionsCount || 0,
      averageRating: avgRating
    });
  };

  const getTodaySessions = () => {
    return sessions.filter(session => isToday(session.scheduledFor));
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(session => 
      format(session.scheduledFor, 'yyyy-MM-dd') === dateStr
    );
  };

  const handlePreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const handleSessionClick = async (session: CalendarSession) => {
    if (session.type === 'discovery') {
      // Fetch full discovery call details
      const { data: callData, error } = await supabase
        .from('discovery_calls')
        .select(`
          *,
          client:profiles!discovery_calls_client_id_fkey(id, first_name, last_name, profile_photo_url)
        `)
        .eq('id', session.id)
        .single();

      if (!error && callData) {
        const client = callData.client as any;
        setSelectedCall(callData);
        setSelectedClient({
          id: callData.client_id,
          name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client',
          profilePhotoUrl: client.profile_photo_url
        });
        setShowManageModal(true);
      }
    }
  };

  const handleCallUpdated = () => {
    fetchSessions();
    fetchStats();
    setShowManageModal(false);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Your Coaching Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Your Coaching Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Week View */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((day, index) => {
              const dayDate = format(day, 'd');
              const dayName = format(day, 'EEE');
              const isCurrentDay = isToday(day);
              const isSelectedDay = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              const daySessions = sessions.filter(s => 
                format(s.scheduledFor, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              );
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "p-2 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                    isCurrentDay && "border-primary",
                    isSelectedDay && "bg-primary/10 border-primary ring-2 ring-primary/20",
                    !isCurrentDay && !isSelectedDay && "bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "text-xs font-medium",
                    (isCurrentDay || isSelectedDay) ? "text-primary" : "text-muted-foreground"
                  )}>
                    {dayName}
                  </div>
                  <div className={cn(
                    "text-lg font-bold mt-1",
                    (isCurrentDay || isSelectedDay) ? "text-primary" : ""
                  )}>
                    {dayDate}
                  </div>
                  {daySessions.length > 0 && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {daySessions.length}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Date's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                {isToday(selectedDate) ? "Today's Schedule" : "Schedule"}
              </h3>
              <span className="text-xs text-muted-foreground">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="space-y-2">
              {getSessionsForDate(selectedDate).length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No sessions scheduled for this date
                </div>
              ) : (
                getSessionsForDate(selectedDate).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{session.time}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {session.client}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        session.status === 'confirmed' ? 'default' :
                        session.status === 'pending' ? 'secondary' : 'outline'
                      }
                    >
                      {session.type === 'discovery' ? 'Discovery' : 'Training'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{stats.activeClients}</div>
                <div className="text-xs text-muted-foreground">Active Clients</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{stats.sessionsThisWeek}</div>
                <div className="text-xs text-muted-foreground">Sessions This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {stats.averageRating || '-'}
                  {stats.averageRating > 0 && <Star className="h-4 w-4 fill-current text-yellow-500" />}
                </div>
                <div className="text-xs text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add New Availability
            </Button>
            <Button variant="outline" size="sm" className="w-full" disabled>
              <ExternalLink className="h-4 w-4 mr-2" />
              Sync with Google Calendar
            </Button>
            <Button variant="outline" size="sm" className="w-full" disabled>
              <CalendarIcon className="h-4 w-4 mr-2" />
              View Monthly Report
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Full calendar management features coming soon
          </div>
        </CardContent>
      </Card>

      {/* Manage Discovery Call Modal */}
      {selectedCall && selectedClient && (
        <ManageDiscoveryCallModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          discoveryCall={selectedCall}
          trainer={selectedClient}
          onCallUpdated={handleCallUpdated}
          viewMode="trainer"
        />
      )}
    </>
  );
};