import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Ban, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface PlanChange {
  id: string;
  change_type: string;
  from_plan_id: string | null;
  to_plan_id: string | null;
  change_reason?: string | null;
  effective_date: string;
  applied_at: string | null;
  initiated_by: string;
  created_at: string;
  metadata?: any;
}

interface PlanChangeHistoryProps {
  trainerId?: string;
}

export const PlanChangeHistory = ({ trainerId }: PlanChangeHistoryProps) => {
  const [changes, setChanges] = useState<PlanChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trainerId) {
      loadHistory();
    }
  }, [trainerId]);

  const loadHistory = async () => {
    if (!trainerId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trainer_membership_history')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChanges(data || []);
    } catch (error: any) {
      toast.error('Failed to load plan history', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'upgrade': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'downgrade': return <ArrowDown className="h-4 w-4 text-orange-600" />;
      case 'cancellation': return <Ban className="h-4 w-4 text-red-600" />;
      case 'reactivation': return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeBadge = (type: string) => {
    const variants: Record<string, any> = {
      upgrade: { variant: 'default', label: 'Upgrade' },
      downgrade: { variant: 'secondary', label: 'Downgrade' },
      cancellation: { variant: 'destructive', label: 'Cancelled' },
      reactivation: { variant: 'default', label: 'Reactivated' }
    };
    const config = variants[type] || { variant: 'outline', label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Change History</CardTitle>
        <CardDescription>
          Complete timeline of your membership plan changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No plan changes yet
          </div>
        ) : (
          <div className="space-y-4">
            {changes.map((change, index) => (
              <div
                key={change.id}
                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background">
                    {getChangeIcon(change.change_type)}
                  </div>
                  {index < changes.length - 1 && (
                    <div className="w-px h-full min-h-[40px] bg-border mt-2" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChangeBadge(change.change_type)}
                      {change.applied_at ? (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Applied
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(change.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Effective Date: {format(new Date(change.effective_date), 'MMM d, yyyy')}
                    </p>
                    {change.change_reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {change.change_reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Initiated by: {change.initiated_by}
                    </p>
                  </div>

                  {change.metadata?.immediate && (
                    <Badge variant="destructive" className="text-xs">
                      Immediate Effect
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
