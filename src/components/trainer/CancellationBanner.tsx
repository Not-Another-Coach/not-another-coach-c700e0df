import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface CancellationBannerProps {
  renewalDate: string;
  graceEndDate: string;
  onReactivate: () => void;
}

export function CancellationBanner({ 
  renewalDate, 
  graceEndDate,
  onReactivate 
}: CancellationBannerProps) {
  const [loading, setLoading] = useState(false);

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('reactivate_trainer_plan' as any);
      if (error) throw error;

      toast.success('Plan Reactivated', {
        description: 'Your plan will continue as normal on your next renewal.'
      });

      onReactivate();
    } catch (error: any) {
      toast.error('Reactivation Failed', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const daysUntilCancellation = Math.ceil(
    (new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Plan Cancellation Scheduled</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          Your plan will cancel on <strong>{renewalDate}</strong> ({daysUntilCancellation} days).
          You have until <strong>{graceEndDate}</strong> to reactivate without losing access.
        </p>
        <Button 
          onClick={handleReactivate} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {loading ? 'Reactivating...' : 'Reactivate Plan'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
