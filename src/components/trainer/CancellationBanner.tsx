import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw } from 'lucide-react';
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

      toast.success('✅ Plan Reactivated', {
        description: 'Your membership continues without interruption.'
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
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">Plan Cancellation Scheduled</AlertTitle>
      <AlertDescription>
        <p className="mb-3 text-amber-800 dark:text-amber-200">
          Your plan is set to end on <strong>{renewalDate}</strong> ({daysUntilCancellation} days).
          You'll continue to have full access until then. To keep your membership active, reactivate anytime before <strong>{graceEndDate}</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleReactivate} 
            disabled={loading}
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {loading ? 'Reactivating...' : 'Reactivate Plan'}
          </Button>
        </div>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-3">
          Changed your mind? Contact support to explore other plan options.
        </p>
      </AlertDescription>
    </Alert>
  );
}
