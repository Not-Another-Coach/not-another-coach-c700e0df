import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertTriangle, Calendar } from 'lucide-react';

interface CancelPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  renewalDate: string;
  onSuccess: () => void;
}

export function CancelPlanDialog({ 
  open, 
  onOpenChange, 
  currentPlan, 
  renewalDate,
  onSuccess 
}: CancelPlanDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Too expensive',
    'Not using features',
    'Found alternative',
    'Business closing',
    'Other'
  ];

  const handleCancel = async () => {
    setLoading(true);
    try {
      const finalReason = reason === 'Other' ? customReason : reason;
      
      const { data, error } = await supabase.rpc('cancel_trainer_plan' as any, {
        p_cancellation_reason: finalReason,
        p_immediate: false
      });

      if (error) throw error;

      toast.success('Cancellation Confirmed', {
        description: `Your cancellation has been confirmed. You'll retain access until ${renewalDate}.`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Cancellation Failed', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Cancel {currentPlan} Plan
          </DialogTitle>
          <DialogDescription>
            We're sorry to see you go. Your plan will remain active until {renewalDate}. You can reactivate anytime before then.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>What's the main reason for leaving?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2 space-y-2">
              {reasons.map(r => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="font-normal cursor-pointer">{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {reason === 'Other' && (
            <div>
              <Label>Please tell us more</Label>
              <Textarea 
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Your feedback helps us improve..."
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Cancellation Details</p>
              <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                <li>• Full access until {renewalDate}</li>
                <li>• You won't be charged again after this date</li>
                <li>• 3-day grace period to reactivate</li>
                <li>• Existing clients unaffected</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Keep Plan
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel} 
              disabled={!reason || loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Confirm & Cancel Plan'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Need help? <a href="mailto:support@example.com" className="underline">Contact support before cancelling</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
