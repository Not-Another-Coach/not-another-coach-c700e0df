import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationAlert {
  id: string;
  alert_type: string;
  title: string;
  content: string;
  metadata: any;
  target_audience: any;
  created_at: string;
}

export const VerificationNotifications = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = React.useState<VerificationAlert[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchVerificationAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('alert_type', 'verification_update')
        .contains('target_audience', { trainers: [user.id] })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setAlerts(data);
      }
    };

    fetchVerificationAlerts();

    // Subscribe to new verification alerts
    const subscription = supabase
      .channel('verification_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `alert_type=eq.verification_update`,
        },
        (payload) => {
          const newAlert = payload.new as VerificationAlert;
          if (newAlert.target_audience?.trainers?.includes(user.id)) {
            setAlerts(prev => [newAlert, ...prev.slice(0, 2)]);
            
            // Show toast notification
            if (newAlert.metadata?.verification_status === 'verified') {
              toast.success(newAlert.title, {
                description: newAlert.content,
              });
            } else if (newAlert.metadata?.verification_status === 'rejected') {
              toast.error(newAlert.title, {
                description: newAlert.content,
              });
            } else {
              toast.info(newAlert.title, {
                description: newAlert.content,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const dismissAlert = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({ is_active: false })
      .eq('id', alertId);
      
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (metadata: any) => {
    if (metadata?.verification_status === 'verified') {
      return <CheckCircle2 className="h-4 w-4" />;
    } else if (metadata?.verification_status === 'rejected') {
      return <XCircle className="h-4 w-4" />;
    } else {
      return <Clock className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (metadata: any) => {
    if (metadata?.verification_status === 'rejected') {
      return 'destructive' as const;
    }
    return 'default' as const;
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={getAlertVariant(alert.metadata)}>
          {getAlertIcon(alert.metadata)}
          <AlertDescription className="flex justify-between items-start">
            <div>
              <strong>{alert.title}</strong>
              <p className="mt-1">{alert.content}</p>
              {alert.metadata?.admin_notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>Admin Notes:</strong> {alert.metadata.admin_notes}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(alert.created_at).toLocaleString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="ml-2"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};