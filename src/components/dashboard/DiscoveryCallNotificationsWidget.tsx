import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, X, Bell } from 'lucide-react';
import { useDiscoveryCallNotifications } from '@/hooks/useDiscoveryCallNotifications';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const DiscoveryCallNotificationsWidget = () => {
  const { profile } = useProfile();
  const {
    notifications,
    upcomingCalls,
    loading,
    markCallAsCompleted,
    cancelCall,
    getNotificationMessage
  } = useDiscoveryCallNotifications();

  const isTrainer = profile?.user_type === 'trainer';

  const handleMarkCompleted = async (callId: string) => {
    const success = await markCallAsCompleted(callId);
    if (success) {
      toast({
        title: "Call marked as completed",
        description: "The discovery call has been marked as completed.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to mark call as completed.",
        variant: "destructive",
      });
    }
  };

  const handleCancelCall = async (callId: string) => {
    const success = await cancelCall(callId, 'Cancelled by user');
    if (success) {
      toast({
        title: "Call cancelled",
        description: "The discovery call has been cancelled and the other party has been notified.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to cancel call.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Discovery Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Discovery Calls
            {upcomingCalls.length > 0 && (
              <Badge variant="secondary">{upcomingCalls.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingCalls.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming discovery calls</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingCalls.map((call) => {
                const isUpcoming = new Date(call.scheduled_for) > new Date();
                const otherPerson = isTrainer ? call.client : call.trainer;
                
                return (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {isTrainer ? 'Call with' : 'Call with'} {otherPerson?.first_name} {otherPerson?.last_name}
                        </span>
                        {call.reminder_24h_sent && (
                          <Badge variant="outline" className="text-xs">
                            24h reminder sent
                          </Badge>
                        )}
                        {call.reminder_1h_sent && (
                          <Badge variant="outline" className="text-xs">
                            1h reminder sent
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(call.scheduled_for), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(call.scheduled_for), 'HH:mm')} ({call.duration_minutes} min)
                        </div>
                      </div>
                      {call.booking_notes && (
                        <p className="text-sm text-muted-foreground">
                          Notes: {call.booking_notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isUpcoming && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelCall(call.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      {isTrainer && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMarkCompleted(call.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
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

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.sent_at), 'MMM dd, HH:mm')}
                    </p>
                    {notification.error_message && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {notification.error_message}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={notification.error_message ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {notification.notification_type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};