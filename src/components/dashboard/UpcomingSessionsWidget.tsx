import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, User } from 'lucide-react';
import { useDiscoveryCallNotifications } from '@/hooks/useDiscoveryCallNotifications';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { format } from 'date-fns';

export const UpcomingSessionsWidget = () => {
  const { isTrainer } = useUserTypeChecks();
  const { upcomingCalls, loading } = useDiscoveryCallNotifications();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isTrainerUser = isTrainer();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Upcoming Sessions
          {upcomingCalls.length > 0 && (
            <Badge variant="secondary">{upcomingCalls.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingCalls.length === 0 ? (
          <div className="text-center py-4">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <div className="text-3xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">Next 7 days</p>
            <Button variant="outline" className="mt-3 w-full">
              View Calendar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingCalls.slice(0, 3).map((call) => {
              const otherPerson = isTrainerUser ? call.client : call.trainer;
              return (
                <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span className="text-sm font-medium">
                        {otherPerson?.first_name} {otherPerson?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(call.scheduled_for), 'MMM dd')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(call.scheduled_for), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Discovery Call
                  </Badge>
                </div>
              );
            })}
            {upcomingCalls.length > 3 && (
              <Button variant="outline" className="w-full mt-3">
                View All ({upcomingCalls.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};