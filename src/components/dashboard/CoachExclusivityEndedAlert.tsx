import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Clock } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';

export function CoachExclusivityEndedAlert() {
  const { alerts, dismissAlert } = useAlerts();
  const [exclusivityEndedAlerts, setExclusivityEndedAlerts] = useState<any[]>([]);

  useEffect(() => {
    const endedAlerts = alerts.filter(
      alert => alert.alert_type === 'waitlist_exclusivity_ended' && alert.is_active
    );
    setExclusivityEndedAlerts(endedAlerts);
  }, [alerts]);

  const handleDismiss = async (alertId: string) => {
    await dismissAlert(alertId);
  };

  if (exclusivityEndedAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {exclusivityEndedAlerts.map(alert => (
        <Alert key={alert.id} className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">{alert.title}</p>
              <p className="text-blue-700">{alert.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(alert.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}