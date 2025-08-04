import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { useActivityAlerts } from '@/hooks/useActivityAlerts';
import { format } from 'date-fns';

export const LiveActivityFeed = () => {
  const { alerts, loading } = useActivityAlerts();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Activity</CardTitle>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Activity</CardTitle>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent activity</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.color}`}>
              <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm mt-1 opacity-75">{alert.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {format(new Date(alert.created_at), 'h:mm a')}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};